/* eslint-disable react-hooks/immutability */
'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera, useTexture, Splat } from '@react-three/drei'
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

  // GLSL Simplex Noise 3D
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){ 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

    i = mod(i, 289.0 ); 
    vec4 p = permute( permute( permute( 
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  vec3 curlNoise(vec3 p) {
      const float e = .1;
      vec3 dx = vec3(e   , 0.0 , 0.0);
      vec3 dy = vec3(0.0 , e   , 0.0);
      vec3 dz = vec3(0.0 , 0.0 , e  );

      vec3 p_x0 = vec3(snoise(p - dx), snoise(p - dx + vec3(43.2)), snoise(p - dx + vec3(98.3)));
      vec3 p_x1 = vec3(snoise(p + dx), snoise(p + dx + vec3(43.2)), snoise(p + dx + vec3(98.3)));
      vec3 p_y0 = vec3(snoise(p - dy), snoise(p - dy + vec3(43.2)), snoise(p - dy + vec3(98.3)));
      vec3 p_y1 = vec3(snoise(p + dy), snoise(p + dy + vec3(43.2)), snoise(p + dy + vec3(98.3)));
      vec3 p_z0 = vec3(snoise(p - dz), snoise(p - dz + vec3(43.2)), snoise(p - dz + vec3(98.3)));
      vec3 p_z1 = vec3(snoise(p + dz), snoise(p + dz + vec3(43.2)), snoise(p + dz + vec3(98.3)));

      float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
      float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
      float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

      const float divisor = 1.0 / ( 2.0 * e );
      return normalize( vec3( x , y , z ) * divisor );
  }

  void main() {
    vUv = uv;
    
    vec4 texColor = texture2D(uTexture, uv);
    vColor = texColor.rgb;
    
    float luminance = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
    vec3 pos = position;
    
    // Extrude depth with a non-linear curve for more dramatic peaks
    pos.z += pow(luminance, 1.5) * 1.8 * uProgress;
    
    // Extreme Curl Noise Field (x10000 Agents Chaos Forge)
    vec3 curl = curlNoise(vec3(pos.x * 2.0, pos.y * 2.0, uTime * 0.4));
    pos.xyz += curl * 0.12 * (1.0 - uProgress * 0.3);
    
    // Cursor physics (Vortex + Repulsion)
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    float dist = distance(modelPosition.xy, uMouse);
    
    // Smooth cinematic falloff
    float force = smoothstep(1.8, 0.0, dist);
    if (force > 0.0) {
      vec2 dir = normalize(modelPosition.xy - uMouse);
      vec2 vortex = vec2(-dir.y, dir.x); // Swirl tangent
      
      // Dramatic Z pop and fluid XY swirl
      modelPosition.z += pow(force, 1.2) * 1.0 * uProgress;
      modelPosition.xy += dir * force * 0.3 * uProgress;
      modelPosition.xy += vortex * force * 0.4 * uProgress;
    }
    
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    
    // Shimmer effect and responsive size
    float shimmer = 1.0 + sin(uTime * 4.0 + luminance * 10.0) * 0.15;
    gl_PointSize = (24.0 / -viewPosition.z) * (0.8 + luminance * 1.2) * shimmer;
  }
`

const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vColor;

  void main() {
    vec2 temp = gl_PointCoord - vec2(0.5);
    float dist = length(temp);
    if (dist > 0.5) {
      discard;
    }
    
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
      
      const targetX = (state.pointer.x * state.viewport.width) / 2
      const targetY = (state.pointer.y * state.viewport.height) / 2
      
      // More elastic, responsive mouse tracking
      materialRef.current.uniforms.uMouse.value.x += (targetX - materialRef.current.uniforms.uMouse.value.x) * 0.12
      materialRef.current.uniforms.uMouse.value.y += (targetY - materialRef.current.uniforms.uMouse.value.y) * 0.12
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
  const [useRealSplat, setUseRealSplat] = useState(false)
  
  if (!isVisible) return null

  const artworkSrc = {
    james: '/assets/james.webp',
    amy: '/assets/amy.webp',
    lagrimas: '/assets/lagrimas.webp'
  }[activeArtwork]

  return (
    <div className="fixed inset-0 z-[140] bg-[#050505] animate-in fade-in duration-1000">
      <Canvas dpr={[1, 2]} gl={{ antialias: false, alpha: false }}>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        <Environment preset="night" />
        
        {/* Enhanced Cinematic Kinetics */}
        <OrbitControls 
          makeDefault 
          enablePan={true} 
          enableZoom={true} 
          enableDamping={true}
          dampingFactor={0.04}
          autoRotate={true}
          autoRotateSpeed={0.4}
          minDistance={2} 
          maxDistance={8}
          minAzimuthAngle={-Math.PI / 3}
          maxAzimuthAngle={Math.PI / 3}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
        />

        <Suspense fallback={null}>
          <PreloadTextures />
          {useRealSplat ? (
            <Splat src={`/assets/${activeArtwork}_scan.splat`} position={[0, 0, 0]} rotation={[0, Math.PI, 0]} scale={2} />
          ) : (
            <VolumetricPainting textureSrc={artworkSrc} progress={depthProgress} />
          )}
        </Suspense>
      </Canvas>
      
      {/* HUD - Control Panel */}
      <div className="absolute top-8 left-8 text-[10px] uppercase tracking-widest text-primary/70 font-sans pointer-events-none space-y-2">
        <p className="font-semibold text-white">Naroa Gutiérrez Gil</p>
        <p>Acrílico sobre pizarra</p>
      </div>

      {/* Selector de Motor de Renderizado */}
      <div className="absolute top-20 left-8 flex flex-col gap-2 z-[250] mt-2">
        <button
          onClick={() => setUseRealSplat(!useRealSplat)}
          className={`px-4 py-2 border font-sans uppercase tracking-[0.2em] text-[8px] transition-all duration-500 rounded-sm pointer-events-auto ${
            useRealSplat
              ? 'border-[#ff3366] text-[#ff3366] bg-[#ff3366]/10 font-bold shadow-[0_0_15px_rgba(255,51,102,0.3)]'
              : 'border-white/20 text-white/60 bg-[#0c0c0e]/80 hover:border-white/50 hover:text-white'
          }`}
        >
          {useRealSplat ? '■ SOTA 3DGS ENGINE ACTIVE' : '▶ ENABLE GAUSSIAN SPLATTING'}
        </button>
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
          <span>Profundidad</span>
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
      </div>
    </div>
  )
}
