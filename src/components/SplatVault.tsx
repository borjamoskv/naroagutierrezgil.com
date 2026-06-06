'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera, useTexture } from '@react-three/drei'
import { Suspense, useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

interface SplatVaultProps {
  isVisible: boolean;
}

const vertexShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uProgress;

  varying vec2 vUv;
  varying vec3 vColor;

  void main() {
    vUv = uv;
    
    // Sample color from texture
    vec4 texColor = texture2D(uTexture, uv);
    vColor = texColor.rgb;
    
    // Displace vertex based on luminance (volumetric depth)
    float luminance = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
    
    vec3 pos = position;
    
    // Extrude depth
    pos.z += luminance * 1.5 * uProgress;
    
    // Subtly animate particles in 3D space
    pos.x += sin(uv.y * 10.0 + uTime * 0.4) * 0.03 * (1.0 - uProgress * 0.5);
    pos.y += cos(uv.x * 10.0 + uTime * 0.4) * 0.03 * (1.0 - uProgress * 0.5);
    
    // Cursor physics (repulsion)
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    float dist = distance(modelPosition.xy, uMouse);
    if (dist < 1.5) {
      float force = (1.5 - dist) / 1.5;
      // Push along Z and away from mouse in XY
      modelPosition.z += force * 0.6 * uProgress;
      modelPosition.xy += normalize(modelPosition.xy - uMouse) * force * 0.3 * uProgress;
    }
    
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
    
    // Size attenuation (bigger when close, responsive to luminance)
    gl_PointSize = (22.0 / -viewPosition.z) * (1.0 + luminance * 0.8);
  }
`

const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vColor;

  void main() {
    // Round particles
    vec2 temp = gl_PointCoord - vec2(0.5);
    float dist = length(temp);
    if (dist > 0.5) {
      discard;
    }
    
    // Soft particle falloff
    float alpha = smoothstep(0.5, 0.1, dist);
    
    gl_FragColor = vec4(vColor, alpha * 0.85);
  }
`

function VolumetricPainting({ textureSrc, progress }: { textureSrc: string; progress: number }) {
  const texture = useTexture(textureSrc)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  
  const count = 250;
  const [points, uvs] = useMemo(() => {
    const posArr = new Float32Array(count * count * 3)
    const uvArr = new Float32Array(count * count * 2)
    
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        const u = i / (count - 1)
        const v = j / (count - 1)
        
        const idx3 = (i * count + j) * 3
        const idx2 = (i * count + j) * 2
        
        // Setup coordinates
        posArr[idx3] = (u - 0.5) * 3.5
        posArr[idx3 + 1] = (v - 0.5) * 4.5
        posArr[idx3 + 2] = 0
        
        uvArr[idx2] = u
        uvArr[idx2 + 1] = v
      }
    }
    return [posArr, uvArr]
  }, [count])

  const uniforms = useMemo(() => ({
    uTexture: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uProgress: { value: 1.0 },
  }), [])

  useEffect(() => {
    if (texture) {
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      if (materialRef.current) {
        materialRef.current.uniforms.uTexture.value = texture
      }
    }
  }, [texture])

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = progress
    }
  }, [progress])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
      
      // Interpolate mouse coordinates in 3D space
      const targetX = (state.pointer.x * state.viewport.width) / 2
      const targetY = (state.pointer.y * state.viewport.height) / 2
      
      materialRef.current.uniforms.uMouse.value.x += (targetX - materialRef.current.uniforms.uMouse.value.x) * 0.08
      materialRef.current.uniforms.uMouse.value.y += (targetY - materialRef.current.uniforms.uMouse.value.y) * 0.08
    }
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
        />
        <bufferAttribute
          attach="attributes-uv"
          args={[uvs, 2]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function PreloadTextures() {
  useTexture.preload('/assets/james.webp')
  useTexture.preload('/assets/amy.webp')
  useTexture.preload('/assets/lagrimas.webp')
  return null
}

export default function SplatVault({ isVisible }: SplatVaultProps) {
  const [activeArtwork, setActiveArtwork] = useState<'james' | 'amy' | 'lagrimas'>('james')
  const [depthProgress, setDepthProgress] = useState(1.0)
  
  if (!isVisible) return null

  const artworkSrc = {
    james: '/assets/james.webp',
    amy: '/assets/amy.webp',
    lagrimas: '/assets/lagrimas.webp'
  }[activeArtwork]

  return (
    <div className="fixed inset-0 z-[140] bg-[#050505] animate-in fade-in duration-1000">
      <Canvas dpr={[1, 2]} gl={{ antialias: false, alpha: false }}>
        {/* Volumetric / Cinematic Camera */}
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        
        {/* Organic Slate Environment Reflections */}
        <Environment preset="night" />
        
        {/* Controls for Excavation */}
        <OrbitControls 
          makeDefault 
          enablePan={true} 
          enableZoom={true} 
          minDistance={2} 
          maxDistance={8}
          minAzimuthAngle={-Math.PI / 3}
          maxAzimuthAngle={Math.PI / 3}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
        />

        <Suspense fallback={null}>
          <PreloadTextures />
          <VolumetricPainting textureSrc={artworkSrc} progress={depthProgress} />
        </Suspense>
      </Canvas>
      
      {/* HUD - Control Panel */}
      <div className="absolute top-8 left-8 text-[10px] uppercase tracking-widest text-primary/70 font-sans pointer-events-none space-y-2">
        <p className="font-semibold text-white">Excavación Volumétrica SOTA</p>
        <p>Resolución: 62,500 Partículas HSL</p>
        <p>Interactividad: Arrastrar para rotar / Scroll para Zoom</p>
        <p className="text-foreground/40">Física: Repulsión por campo de cursor</p>
      </div>

      {/* Selector de Obra */}
      <div className="absolute top-8 right-8 flex flex-col gap-2 z-[250]">
        {(['james', 'amy', 'lagrimas'] as const).map((art) => (
          <button
            key={art}
            onClick={() => setActiveArtwork(art)}
            className={`px-4 py-2 border font-sans uppercase tracking-[0.2em] text-[9px] transition-all duration-500 rounded-sm ${
              activeArtwork === art
                ? 'border-primary text-black bg-primary font-medium'
                : 'border-white/10 text-white/50 bg-[#0c0c0e]/80 hover:border-white/30 hover:text-white'
            }`}
          >
            {art === 'james' ? 'James Dean' : art === 'amy' ? 'Amy Winehouse' : 'Lágrimas de Oro'}
          </button>
        ))}
      </div>

      {/* Control de Extrusión / Fricción */}
      <div className="absolute bottom-8 left-8 z-[250] flex flex-col gap-2 bg-[#0c0c0e]/80 border border-white/5 p-4 rounded-sm max-w-xs w-64 backdrop-blur-md">
        <div className="flex justify-between text-[9px] uppercase tracking-widest text-white/60">
          <span>Relieve Tridimensional</span>
          <span className="text-primary font-mono">{Math.round(depthProgress * 100)}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="2" 
          step="0.05"
          value={depthProgress}
          onChange={(e) => setDepthProgress(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
        />
        <span className="text-[8px] text-white/30 uppercase tracking-widest leading-normal">
          Aumenta la extrusión para separar la pintura de la pizarra y ver su estructura molecular.
        </span>
      </div>
    </div>
  )
}
