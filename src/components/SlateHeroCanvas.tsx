import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sparkles, Float } from '@react-three/drei'
import * as THREE from 'three'

const SlateKintsugiShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uGoldColor: { value: new THREE.Color('#F59E0B') },
    uSlateColor: { value: new THREE.Color('#080a12') },
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
    uniform vec3 uSlateColor;
    uniform vec3 uCobaltColor;
    uniform vec2 uFractureOrigin;
    uniform float uFractureIntensity;

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
      float n1 = snoise(uv * 7.0) * 0.5 + 0.5;
      float n2 = snoise(uv * 22.0) * 0.25;
      float slateGrain = clamp(n1 + n2, 0.0, 1.0);
      
      // Deep Basque slate texture background
      vec3 slate = mix(uSlateColor, vec3(0.03, 0.05, 0.10), slateGrain * 0.7);
      
      // Kintsugi golden fracture veins (ridged noise)
      float r1 = 1.0 - abs(snoise(uv * 4.5 + vec2(uTime * 0.02, 0.0)));
      float r2 = 1.0 - abs(snoise(uv * 10.0 - vec2(0.0, uTime * 0.03)));
      float crackle = pow(r1 * r2, 3.2);
      
      float goldWave = sin(uTime * 1.5 + (uv.x + uv.y) * 8.0) * 0.4 + 0.6;
      vec3 goldVeins = uGoldColor * crackle * 4.5 * goldWave;

      // Secondary YInMn Cobalt veins
      float cobaltRidge = pow(1.0 - abs(snoise(uv * 8.0 + 4.0)), 4.0);
      vec3 cobaltVeins = uCobaltColor * cobaltRidge * 2.0;
      
      // Ambient radial glow around cursor that activates gold veins
      float distToMouse = length(uv - uMouse);
      float mouseGlow = smoothstep(0.45, 0.0, distToMouse);
      vec3 cursorGlow = mix(uGoldColor * 2.0, uCobaltColor * 2.5, sin(uTime * 0.8) * 0.5 + 0.5) * mouseGlow;
      
      // Interactive Fracture Shockwave (Exergy Optimized Dispersion)
      float distToFracture = length(uv - uFractureOrigin);
      
      // Inject organic jaggedness using simplex noise
      float jagged = snoise(uv * 18.0 - vec2(uTime * 0.2, 0.0)) * 0.03;
      float d = distToFracture + jagged;
      
      float shock = smoothstep(uFractureIntensity, uFractureIntensity - 0.04, d) * smoothstep(uFractureIntensity - 0.12, uFractureIntensity, d);
      vec3 fractureGlow = uGoldColor * shock * 5.0 * exp(-uFractureIntensity * 2.8);

      vec3 finalColor = slate + goldVeins + cobaltVeins + cursorGlow * (0.25 + crackle * 1.5) + fractureGlow;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
}

function SlateSurface() {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const fractureOriginRef = useRef(new THREE.Vector2(-1, -1))
  const fractureIntensityRef = useRef(0)
  const { viewport } = useThree()

  // Dynamic time-of-day lighting cycle (Day: Kintsugi Gold, Night: YInMn Cobalt Noir)
  const ambientTone = useMemo(() => {
    const hour = new Date().getHours()
    return (hour >= 7 && hour < 20) ? '#F59E0B' : '#2B3BE5'
  }, [])

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uGoldColor: { value: new THREE.Color('#F59E0B') },
      uSlateColor: { value: new THREE.Color('#080a12') },
      uCobaltColor: { value: new THREE.Color('#2B3BE5') },
      uFractureOrigin: { value: new THREE.Vector2(-1, -1) },
      uFractureIntensity: { value: 0 }
    }
  }, [])

  useFrame((state, delta) => {
    const { pointer, clock } = state

    // Normalize pointer from [-1, 1] to [0, 1] for shader UVs
    const normX = (pointer.x + 1) / 2
    const normY = (pointer.y + 1) / 2

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime()
      materialRef.current.uniforms.uMouse.value.x = THREE.MathUtils.lerp(materialRef.current.uniforms.uMouse.value.x, normX, 0.1)
      materialRef.current.uniforms.uMouse.value.y = THREE.MathUtils.lerp(materialRef.current.uniforms.uMouse.value.y, normY, 0.1)
      
      // Update interactive fracture state (Zero-Friction + Safe Delta Clamping)
      const safeDelta = Math.min(delta, 0.1); // Prevents catastrophic tab-switching buildup
      
      if (fractureIntensityRef.current > 0 && fractureIntensityRef.current < 2.0) {
        // Logarithmic decay of velocity for natural spring-like expansion
        const velocity = Math.max(0.2, (2.0 - fractureIntensityRef.current) * 1.8);
        fractureIntensityRef.current += safeDelta * velocity;
      } else if (fractureIntensityRef.current >= 2.0) {
        fractureIntensityRef.current = 0;
        fractureOriginRef.current.set(-1.0, -1.0);
      }
      
      materialRef.current.uniforms.uFractureOrigin.value.copy(fractureOriginRef.current);
      materialRef.current.uniforms.uFractureIntensity.value = fractureIntensityRef.current;
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
      <pointLight ref={lightRef} position={[0, 0, 2.5]} intensity={6.0} color={ambientTone} distance={12} decay={1.2} />
      <pointLight position={[-viewport.width / 3, viewport.height / 3, 1]} intensity={2.0} color="#2B3BE5" />
      <pointLight position={[viewport.width / 3, -viewport.height / 3, 1]} intensity={2.0} color="#F59E0B" />

      {/* Main Slate Slab with Kintsugi Shader */}
      <mesh 
        ref={meshRef} 
        position={[0, 0, 0]}
        onClick={(e) => {
          if (e.uv) {
            fractureOriginRef.current.copy(e.uv);
            fractureIntensityRef.current = 0.01;
          }
        }}
      >
        <planeGeometry args={[viewport.width * 1.3, viewport.height * 1.3, 32, 32]} />
        <shaderMaterial
          ref={materialRef}
          args={[SlateKintsugiShader]}
          uniforms={uniforms}
        />
      </mesh>

      {/* Floating Mica Dust, Gold Flakes and Cobalt Sparkles */}
      <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.4}>
        <group position={[0, 0, 0.3]}>
          <Sparkles count={250} scale={[viewport.width * 1.2, viewport.height * 1.2, 2.5]} size={4.5} speed={0.6} color="#F59E0B" />
          <Sparkles count={120} scale={[viewport.width * 1.2, viewport.height * 1.2, 2.5]} size={3.5} speed={0.8} color="#2B3BE5" />
          <Sparkles count={100} scale={[viewport.width * 1.2, viewport.height * 1.2, 2.5]} size={2.5} speed={0.4} color="#ffffff" />
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
        <ambientLight intensity={0.6} />
        <SlateSurface />
      </Canvas>
    </div>
  )
}


