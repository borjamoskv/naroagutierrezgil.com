import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sparkles, Float } from '@react-three/drei'
import * as THREE from 'three'

const SlateKintsugiShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uGoldColor: { value: new THREE.Color('#F59E0B') },
    uSlateColor: { value: new THREE.Color('#0e111a') },
    uCobaltColor: { value: new THREE.Color('#2B3BE5') }
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
    uniform vec3 uSlateColor;
    uniform vec3 uCobaltColor;

    varying vec2 vUv;

    // Simplex 2D noise function
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
      
      // Slate rock noise texture
      float n1 = snoise(uv * 8.0) * 0.5 + 0.5;
      float n2 = snoise(uv * 25.0) * 0.25;
      float slateGrain = clamp(n1 + n2, 0.0, 1.0);
      
      // Rich Basque slate texture background
      vec3 slate = mix(uSlateColor, vec3(0.04, 0.06, 0.12), slateGrain * 0.6);
      
      // Ambient radial glow around cursor
      float distToMouse = length(uv - uMouse);
      float mouseGlow = smoothstep(0.6, 0.0, distToMouse);
      vec3 cursorGlow = mix(uGoldColor, uCobaltColor, sin(uTime * 0.6) * 0.5 + 0.5) * mouseGlow * 0.25;
      
      vec3 finalColor = slate + cursorGlow;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
}

function SlateSurface() {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const { viewport } = useThree()

  // Dynamic time-of-day lighting cycle (Day: Kintsugi Gold, Night: YInMn Cobalt Noir)
  const ambientTone = useMemo(() => {
    const hour = new Date().getHours()
    return (hour >= 7 && hour < 20) ? '#D4AF37' : '#2B3BE5'
  }, [])

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uGoldColor: { value: new THREE.Color('#D4AF37') },
      uSlateColor: { value: new THREE.Color('#07070a') },
      uCobaltColor: { value: new THREE.Color('#2B3BE5') }
    }
  }, [])

  useFrame((state) => {
    const { pointer, clock } = state


    // Normalize pointer from [-1, 1] to [0, 1] for shader UVs
    const normX = (pointer.x + 1) / 2
    const normY = (pointer.y + 1) / 2

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
      materialRef.current.uniforms.uMouse.value.x = THREE.MathUtils.lerp(materialRef.current.uniforms.uMouse.value.x, normX, 0.1)
      materialRef.current.uniforms.uMouse.value.y = THREE.MathUtils.lerp(materialRef.current.uniforms.uMouse.value.y, normY, 0.1)
    }

    const targetX = (pointer.x * viewport.width) / 2
    const targetY = (pointer.y * viewport.height) / 2
    
    if (lightRef.current) {
      lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, targetX, 0.08)
      lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, targetY, 0.08)
    }

    if (meshRef.current) {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -pointer.y * 0.06, 0.05)
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, pointer.x * 0.06, 0.05)
    }
  })

  return (
    <>
      <pointLight ref={lightRef} position={[0, 0, 2.5]} intensity={5.0} color={ambientTone} distance={10} decay={1.2} />
      <pointLight position={[-viewport.width / 3, viewport.height / 3, 1]} intensity={1.5} color="#2B3BE5" />

      {/* Main Slate Slab with Kintsugi Shader */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[viewport.width * 1.3, viewport.height * 1.3, 32, 32]} />
        <shaderMaterial
          ref={materialRef}
          args={[SlateKintsugiShader]}
          uniforms={uniforms}
        />
      </mesh>

      {/* Floating Mica Dust and Gold Sparkles */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <group position={[0, 0, 0.3]}>
          <Sparkles count={200} scale={[viewport.width * 1.2, viewport.height * 1.2, 2]} size={4.0} speed={0.5} color="#D4AF37" />
          <Sparkles count={100} scale={[viewport.width * 1.2, viewport.height * 1.2, 2]} size={3.0} speed={0.7} color="#2B3BE5" />
          <Sparkles count={80} scale={[viewport.width * 1.2, viewport.height * 1.2, 2]} size={2.0} speed={0.3} color="#ffffff" />
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
        <ambientLight intensity={0.5} />
        <SlateSurface />
      </Canvas>
    </div>
  )
}

