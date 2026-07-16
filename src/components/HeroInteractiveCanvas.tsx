'use client';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';

// Shaders for the Monumental Slate Portrait in Hero Section
// Credits: Borja Moskv (borjamoskv) / MOSKV-1 APEX
const heroVertexShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform float uScrollProgress;
  uniform float uAppMode;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vDepth;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Wave movement simulating slate relief
    float slateRelief = sin(uv.x * 12.0 + uTime * 0.2) * cos(uv.y * 12.0 + uTime * 0.2) * 0.01;
    
    // Extrude based on cursor distance
    float dist = distance(uv, uMouse);
    float cursorPush = smoothstep(0.35, 0.0, dist) * 0.04 * (1.0 - uScrollProgress);
    
    // Extra organic chaotic ripple when in CHAOS mode
    float chaosRipple = sin(uv.x * 24.0 + uTime * 2.5) * cos(uv.y * 24.0 + uTime * 2.5) * 0.035 * uAppMode;
    
    pos.z += slateRelief + cursorPush + chaosRipple;
    
    // Apply scroll disintegration deformation
    if (uScrollProgress > 0.01) {
      pos.x += sin(uv.y * 10.0 + uTime * 2.0) * 0.15 * uScrollProgress;
      pos.y += cos(uv.x * 10.0 + uTime * 2.0) * 0.15 * uScrollProgress;
      pos.z += uScrollProgress * 0.5;
    }
    
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    
    vNormal = normalMatrix * normal;
    vViewPosition = -viewPosition.xyz;
    vDepth = pos.z;
  }
`;

const heroFragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScrollProgress;
  uniform float uOpacity;
  uniform float uAppMode;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vDepth;
  
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  // FBM (Fractal Brownian Motion) for Slate Texture
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
               mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float f = 0.0;
    float w = 0.5;
    for (int i = 0; i < 5; i++) {
      f += w * noise(p);
      p *= 2.0;
      w *= 0.5;
    }
    return f;
  }
  
  void main() {
    // Scroll disintegration dissolve
    if (uScrollProgress > 0.85) {
      discard;
    }
    
    vec2 uv = vUv;
    
    // 1. Excavación Volumétrica: La obra respira luz base, el foco intensifica la materia
    float distToMouse = distance(uv, uMouse);
    float lightIntensity = smoothstep(0.7, 0.0, distToMouse); // Foco más amplio y suave
    
    // 2. Realidad Inestable / CHAOS Mode Glitch
    if (uAppMode > 0.01) {
      float glitchForce = sin(uTime * 15.0 + vUv.y * 40.0) * 0.008 * uAppMode;
      uv.x += glitchForce;
    }
    
    vec4 texColor = texture2D(uTexture, uv);
    
    // Bump mapping procedural: Slate texture
    float bump = fbm(uv * 15.0);
    float bumpX = fbm(uv * 15.0 + vec2(0.01, 0.0));
    float bumpY = fbm(uv * 15.0 + vec2(0.0, 0.01));
    vec3 normal = normalize(vNormal + vec3(bumpX - bump, bumpY - bump, 0.0) * 8.0);
    vec3 viewDir = normalize(vViewPosition);
    
    // Dynamic Spotlight
    vec3 lightPos = vec3(uMouse.x - 0.5, uMouse.y - 0.5, 0.3 + 0.2 * uAppMode);
    vec3 surfacePos = vec3(vUv.x - 0.5, vUv.y - 0.5, vDepth);
    vec3 lightDir = normalize(lightPos - surfacePos);
    
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 48.0);
    
    // 3. Microscopio Neural: Mica procedimental (Escamas de mineral vibrantes)
    float micaFrequency = 300.0;
    float micaNoise = hash(floor(vUv * micaFrequency) + uTime * 0.1 * (1.0 + uAppMode));
    float micaSparkle = 0.0;
    if (micaNoise > 0.92) {
      float speed = 1.0 + micaNoise * 2.0;
      float blink = 0.5 + 0.5 * sin(uTime * speed + micaNoise * 20.0);
      micaSparkle = pow(max(dot(normal, halfDir), 0.0), 64.0) * blink * (1.0 + lightIntensity * 2.0);
    }
    
    // 4. Kintsugi Reactivo
    float kintsugiNoise = fbm(vUv * 8.0 + sin(vUv.y * 10.0));
    float veinWidth = 0.005 + (uAppMode * 0.015);
    float isVein = smoothstep(veinWidth, 0.0, abs(kintsugiNoise - 0.45));
    
    vec3 goldColor = vec3(1.0, 0.8, 0.2);
    float goldVeinGlow = smoothstep(0.6, 0.0, distToMouse);
    
    // BALANCE TERMODINÁMICO DE LUZ
    // El lienzo es visible con una penumbra cinemática constante (0.45)
    vec3 ambient = texColor.rgb * 0.45; 
    vec3 diffuseColor = texColor.rgb * diff * (0.8 + lightIntensity * 2.0); 
    vec3 specularColor = vec3(0.9, 0.9, 1.0) * spec * (0.3 + lightIntensity * 0.7);
    
    vec3 finalColor = ambient + diffuseColor + specularColor;
    
    // Injection of Minerals & Kintsugi
    finalColor += vec3(0.8, 0.9, 1.0) * micaSparkle;
    
    vec3 veinColor = goldColor * (1.0 + goldVeinGlow * 2.5 + (uAppMode * 2.0));
    finalColor = mix(finalColor, veinColor, isVein * (0.4 + 0.6 * lightIntensity));
    
    // CAOS MODE: Termodinámica / Emisión de energía
    if (uAppMode > 0.01) {
      finalColor += vec3(0.1, 0.3, 0.9) * fbm(uv * 5.0 - uTime) * uAppMode * (0.2 + lightIntensity * 0.5);
    }
    
    float alpha = uOpacity * (1.0 - uScrollProgress);
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

function VolumetricHeroPortrait({ url }: { url: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const texture = useLoader(THREE.TextureLoader, url);
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5));
  const targetMouseRef = useRef(new THREE.Vector2(0.5, 0.5));
  const scrollProgressRef = useRef(0);
  const [appModeVal, setAppModeVal] = useState(0.0);

  // Monitor cursor movement and dimension toggling reactively
  useEffect(() => {
    // Read initial mode from window state
    if (typeof window !== 'undefined') {
      const initialMode = localStorage.getItem('naroa_app_mode') || 'ORDEN';
      setAppModeVal(initialMode === 'CAOS' ? 1.0 : 0.0);
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseRef.current.x = e.clientX / window.innerWidth;
      targetMouseRef.current.y = 1.0 - (e.clientY / window.innerHeight); // Invert Y for WebGL
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = window.innerHeight * 0.8;
      scrollProgressRef.current = Math.min(Math.max(scrollY / threshold, 0.0), 1.0);
    };

    const handleDimension = (e: Event) => {
      const mode = (e as CustomEvent).detail;
      setAppModeVal(mode === 'CAOS' ? 1.0 : 0.0);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('dimension-changed', handleDimension);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('dimension-changed', handleDimension);
    };
  }, []);

  const uniforms = useMemo(() => ({
    uTexture: { value: null as THREE.Texture | null },
    uTime: { value: 0.0 },
    uMouse: { value: mouseRef.current },
    uScrollProgress: { value: 0.0 },
    uOpacity: { value: 0.0 },
    uAppMode: { value: 0.0 }
  }), []);

  useEffect(() => {
    if (texture) {
      const tex = texture as any;
      tex['minFilter'] = THREE.LinearFilter;
      tex['colorSpace'] = THREE.SRGBColorSpace;
      tex['needsUpdate'] = true;
      if (materialRef.current) {
        materialRef.current.uniforms.uTexture.value = texture;
      }
    }
  }, [texture]);

  useFrame((state, delta) => {
    // Lerp mouse coordinates for smooth inertia
    mouseRef.current.x = THREE.MathUtils.lerp(mouseRef.current.x, targetMouseRef.current.x, delta * 5.0);
    mouseRef.current.y = THREE.MathUtils.lerp(mouseRef.current.y, targetMouseRef.current.y, delta * 5.0);

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uScrollProgress.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uScrollProgress.value,
        scrollProgressRef.current,
        delta * 6.0
      );
      materialRef.current.uniforms.uAppMode.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uAppMode.value,
        appModeVal,
        delta * 5.0
      );
      // Smooth fade-in on mount
      materialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uOpacity.value,
        1.0,
        delta * 2.0
      );
    }

    // Apply absolute camera/plane parallax rotation
    if (meshRef.current) {
      const tiltX = (mouseRef.current.y - 0.5) * 0.12;
      const tiltY = (mouseRef.current.x - 0.5) * -0.12;
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, tiltX, delta * 4.0);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, tiltY, delta * 4.0);
      
      // Move back slightly on scroll
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, -scrollProgressRef.current * 1.5, delta * 4.0);
    }
  });

  // Scale plane aspect ratio dynamically to match portrait structure
  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <planeGeometry args={[2.8, 3.5, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={heroVertexShader}
        fragmentShader={heroFragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={true}
      />
    </mesh>
  );
}

export default function HeroInteractiveCanvas({ url }: { url: string }) {
  return (
    <div className="w-full h-full relative z-10">
      {/* Background glow vignette inside the canvas space */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(43,59,229,0.04)_0%,transparent_70%)] pointer-events-none z-0" />
      
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 60 }}
        dpr={[1, 1.5]}
        className="w-full h-full"
        style={{ background: '#050505' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 4, 3]} intensity={1.0} castShadow />
        <VolumetricHeroPortrait url={url} />
      </Canvas>
    </div>
  );
}
