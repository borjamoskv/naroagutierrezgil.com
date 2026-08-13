import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sparkles, Float } from '@react-three/drei'
import * as THREE from 'three'

const OrganicSlateKintsugiShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uGoldColor: { value: new THREE.Color('#FFD700') },
    uPopMagenta: { value: new THREE.Color('#FF1493') },
    uSlateColor: { value: new THREE.Color('#0b0914') },
    uCobaltColor: { value: new THREE.Color('#2B3BE5') },
    uFractureOrigin: { value: new THREE.Vector2(-1.0, -1.0) },
    uFractureIntensity: { value: 0.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec3 uGoldColor;
    uniform vec3 uPopMagenta;
    uniform vec3 uSlateColor;
    uniform vec3 uCobaltColor;
    uniform vec2 uFractureOrigin;
    uniform float uFractureIntensity;

    varying vec2 vUv;

    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m*m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = vUv;
      
      // Textura de Pizarra Vasca Pulida con Agua de Colonia y Resina
      float n1 = snoise(uv * 6.0 + vec2(uTime * 0.015, 0.0)) * 0.5 + 0.5;
      float n2 = snoise(uv * 18.0) * 0.25;
      float slateGrain = clamp(n1 + n2, 0.0, 1.0);
      
      vec3 slateBase = mix(uSlateColor, vec3(0.12, 0.05, 0.18), slateGrain * 0.6);
      
      // Vetas de Kintsugi Doradas & Magenta POP (Cantinflowers)
      float r1 = 1.0 - abs(snoise(uv * 4.0 + vec2(uTime * 0.02, 0.0)));
      float r2 = 1.0 - abs(snoise(uv * 9.0 - vec2(0.0, uTime * 0.025)));
      float crackle = pow(r1 * r2, 3.0);
      
      float goldWave = sin(uTime * 1.8 + (uv.x + uv.y) * 6.0) * 0.5 + 0.5;
      vec3 goldVeins = mix(uGoldColor, uPopMagenta, goldWave) * crackle * 4.8;

      // Vetas secundarias de Cobalto YInMn
      float cobaltRidge = pow(1.0 - abs(snoise(uv * 7.0 + 3.0)), 3.8);
      vec3 cobaltVeins = uCobaltColor * cobaltRidge * 2.2;
      
      // Resplandor Orgánico interactivo del cursor
      float distToMouse = length(uv - uMouse);
      float mouseGlow = smoothstep(0.48, 0.0, distToMouse);
      vec3 cursorGlow = mix(uGoldColor * 2.2, uPopMagenta * 2.8, sin(uTime * 1.2) * 0.5 + 0.5) * mouseGlow;
      
      // Onda expansiva de Kintsugi al hacer click
      float distToFracture = length(uv - uFractureOrigin);
      float jagged = snoise(uv * 16.0 - vec2(uTime * 0.2, 0.0)) * 0.035;
      float d = distToFracture + jagged;
      float shock = smoothstep(uFractureIntensity, uFractureIntensity - 0.04, d) * smoothstep(uFractureIntensity - 0.12, uFractureIntensity, d);
      vec3 fractureGlow = mix(uGoldColor, uPopMagenta, sin(uTime * 3.0) * 0.5 + 0.5) * shock * 6.0 * exp(-uFractureIntensity * 2.5);

      vec3 finalColor = slateBase + goldVeins + cobaltVeins + cursorGlow * (0.3 + crackle * 1.8) + fractureGlow;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
}

function OrganicSlateSurface() {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const fractureOriginRef = useRef(new THREE.Vector2(-1, -1))
  const fractureIntensityRef = useRef(0)
  const { viewport } = useThree()

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uGoldColor: { value: new THREE.Color('#FFD700') },
      uPopMagenta: { value: new THREE.Color('#FF1493') },
      uSlateColor: { value: new THREE.Color('#0b0914') },
      uCobaltColor: { value: new THREE.Color('#2B3BE5') },
      uFractureOrigin: { value: new THREE.Vector2(-1, -1) },
      uFractureIntensity: { value: 0 }
    }
  }, [])

  useFrame((state, delta) => {
    const { pointer, clock } = state

    const normX = (pointer.x + 1) / 2
    const normY = (pointer.y + 1) / 2

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
      materialRef.current.uniforms.uMouse.value.x = THREE.MathUtils.lerp(materialRef.current.uniforms.uMouse.value.x, normX, 0.08)
      materialRef.current.uniforms.uMouse.value.y = THREE.MathUtils.lerp(materialRef.current.uniforms.uMouse.value.y, normY, 0.08)

      const safeDelta = Math.min(delta, 0.1)

      if (fractureIntensityRef.current > 0 && fractureIntensityRef.current < 2.2) {
        const velocity = Math.max(0.25, (2.2 - fractureIntensityRef.current) * 2.0)
        fractureIntensityRef.current += safeDelta * velocity
      } else if (fractureIntensityRef.current >= 2.2) {
        fractureIntensityRef.current = 0
        fractureOriginRef.current.set(-1.0, -1.0)
      }

      materialRef.current.uniforms.uFractureOrigin.value.copy(fractureOriginRef.current)
      materialRef.current.uniforms.uFractureIntensity.value = fractureIntensityRef.current
    }

    const targetX = (pointer.x * viewport.width) / 2
    const targetY = (pointer.y * viewport.height) / 2

    if (lightRef.current) {
      lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, targetX, 0.08)
      lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, targetY, 0.08)
    }

    if (meshRef.current) {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -pointer.y * 0.05, 0.05)
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, pointer.x * 0.05, 0.05)
    }
  })

  return (
    <>
      <pointLight ref={lightRef} position={[0, 0, 2.5]} intensity={7.0} color="#FFD700" distance={14} decay={1.1} />
      <pointLight position={[-viewport.width / 3, viewport.height / 3, 1]} intensity={2.8} color="#FF1493" />
      <pointLight position={[viewport.width / 3, -viewport.height / 3, 1]} intensity={2.8} color="#2B3BE5" />

      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        onClick={(e) => {
          if (e.uv) {
            fractureOriginRef.current.copy(e.uv)
            fractureIntensityRef.current = 0.01
          }
        }}
      >
        <planeGeometry args={[viewport.width * 1.35, viewport.height * 1.35, 32, 32]} />
        <shaderMaterial
          ref={materialRef}
          args={[OrganicSlateKintsugiShader]}
          uniforms={uniforms}
        />
      </mesh>

      {/* Partículas Flotantes POP: Escamas de Mica, Pan de Oro y Destellos Rosa Magenta */}
      <Float speed={2.0} rotationIntensity={0.4} floatIntensity={0.5}>
        <group position={[0, 0, 0.35]}>
          <Sparkles count={280} scale={[viewport.width * 1.3, viewport.height * 1.3, 2.8]} size={5.5} speed={0.7} color="#FFD700" />
          <Sparkles count={180} scale={[viewport.width * 1.3, viewport.height * 1.3, 2.8]} size={4.2} speed={0.9} color="#FF1493" />
          <Sparkles count={150} scale={[viewport.width * 1.3, viewport.height * 1.3, 2.8]} size={3.8} speed={0.8} color="#2B3BE5" />
        </group>
      </Float>
    </>
  )
}

export function SlateHeroCanvas() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'auto' }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 60 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#030305']} />
        <ambientLight intensity={0.7} />
        <OrganicSlateSurface />
      </Canvas>
    </div>
  )
}
