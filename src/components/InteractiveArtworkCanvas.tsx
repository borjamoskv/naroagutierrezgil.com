'use client';

import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';

// Shaders for individual artwork interaction in the gallery grid
// Credits: Borja Moskv (borjamoskv) / MOSKV-1 APEX
const kineticVertexShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  uniform float uAppMode;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Wave deformation representing slate fluid elasticity (Hyper-Responsive)
    float dist = distance(uv, uMouse);
    float force = smoothstep(0.45, 0.0, dist);
    
    // Liquid ripple effect under the mouse - brutally intensified in CAOS mode
    float wave = sin(dist * 25.0 - uTime * 6.0) * 0.035 * force * uHover;
    float chaosWave = sin(dist * 45.0 - uTime * 12.0) * 0.08 * force * uAppMode;
    pos.z += wave + chaosWave;
    
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    
    vNormal = normalMatrix * normal;
    vViewPosition = -viewPosition.xyz;
  }
`;

const kineticFragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uAppMode;
  uniform vec2 uUvScale;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  
  void main() {
    // Apply center cover scaling
    vec2 uv = (vUv - 0.5) * uUvScale + 0.5;
    
    // Subtle lens distortion refraction centered at the cursor - intensified in CAOS mode
    float dist = distance(uv, uMouse);
    float force = smoothstep(0.4, 0.0, dist);
    vec2 offsetDir = normalize(uv - uMouse);
    if (dist > 0.001) {
      float lensDistortion = 0.025 * uHover + (uAppMode * 0.08);
      uv -= offsetDir * sin(dist * 6.28) * lensDistortion * force;
    }
    
    // RGB Chromatic Aberration near the cursor in CAOS mode
    float aberration = uAppMode * force * 0.015;
    vec4 texColor;
    if (aberration > 0.0) {
      float r = texture2D(uTexture, uv + offsetDir * aberration).r;
      float g = texture2D(uTexture, uv).g;
      float b = texture2D(uTexture, uv - offsetDir * aberration).b;
      texColor = vec4(r, g, b, 1.0);
    } else {
      texColor = texture2D(uTexture, uv);
    }
    
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    // Virtual point light floating above the cursor
    vec3 lightPos = vec3(uMouse.x - 0.5, uMouse.y - 0.5, 0.35);
    vec3 surfacePos = vec3(vUv.x - 0.5, vUv.y - 0.5, 0.0);
    vec3 lightDir = normalize(lightPos - surfacePos);
    
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 32.0);
    
    // Mica mineral sparkles (procedural high-frequency noise) - Increased blink rate and intensity
    float micaFrequency = 220.0;
    float micaNoise = hash(floor(vUv * micaFrequency));
    float micaSparkle = 0.0;
    if (micaNoise > 0.94) {
      float angleFactor = max(dot(normal, halfDir), 0.0);
      float blink = 0.4 + 0.6 * sin(uTime * (4.0 + micaNoise * 4.0) + micaNoise * 15.0);
      micaSparkle = pow(angleFactor, 32.0) * blink * uHover * 3.5;
    }
    
    // Golden accent color
    vec3 goldColor = vec3(0.96, 0.72, 0.2);
    
    // Add micro kintsugi veins inside the card under CAOS mode - thicker and brighter
    float kintsugiNoise = sin(vUv.x * 35.0 + vUv.y * 50.0 + sin(uTime * 0.5) * 0.5);
    float veinWidth = 0.012 * uAppMode;
    float isVein = smoothstep(veinWidth, 0.0, abs(kintsugiNoise - 0.2));
    
    // Ambient shadows & lighting
    vec3 ambient = texColor.rgb * 0.6;
    vec3 diffuseColor = texColor.rgb * diff * 0.6;
    vec3 specularColor = vec3(1.0) * spec * 0.4 * uHover;
    
    vec3 finalColor = ambient + diffuseColor + specularColor;
    
    // Inject sparkles
    finalColor += goldColor * micaSparkle;
    
    // Blend in gold veins
    vec3 veinColor = goldColor * (1.5 + uAppMode * 2.5);
    finalColor = mix(finalColor, veinColor, isVein * 0.95);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function VolumetricPlane({ url, mouse, isHovered }: { url: string; mouse: THREE.Vector2; isHovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const texture = useLoader(THREE.TextureLoader, url);
  const [appModeVal, setAppModeVal] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('naroa_app_mode') === 'CAOS' ? 1.0 : 0.0;
    }
    return 0.0;
  });
  const { width, height } = useThree((state) => state.viewport);

  // Monitor global dimension state changes reactively
  useEffect(() => {
    const handleDimension = (e: Event) => {
      const mode = (e as CustomEvent).detail;
      setAppModeVal(mode === 'CAOS' ? 1.0 : 0.0);
    };
    window.addEventListener('dimension-changed', handleDimension);
    return () => window.removeEventListener('dimension-changed', handleDimension);
  }, []);

  // Compute cover scale vectors based on aspect ratios
  const uvScale = useMemo(() => {
    const scale = new THREE.Vector2(1, 1);
    if (!texture || !texture.image) return scale;
    const textureAspect = texture.image.width / texture.image.height;
    const viewportAspect = width / height;

    if (textureAspect > viewportAspect) {
      scale.set(viewportAspect / textureAspect, 1);
    } else {
      scale.set(1, textureAspect / viewportAspect);
    }
    return scale;
  }, [texture, width, height]);

  const uniforms = useMemo(() => ({
    uTexture: { value: null as THREE.Texture | null },
    uTime: { value: 0.0 },
    uMouse: { value: mouse },
    uHover: { value: 0.0 },
    uAppMode: { value: 0.0 },
    uUvScale: { value: new THREE.Vector2(1, 1) }
  }), [mouse]);

  useEffect(() => {
    if (texture && materialRef.current) {
      materialRef.current.uniforms.uTexture.value = texture;
    }
  }, [texture]);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uHover.value,
        isHovered ? 1.0 : 0.0,
        delta * 6.0
      );
      materialRef.current.uniforms.uAppMode.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uAppMode.value,
        appModeVal,
        delta * 5.0
      );
      materialRef.current.uniforms.uUvScale.value.copy(uvScale);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[width, height, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={kineticVertexShader}
        fragmentShader={kineticFragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
}

export default function InteractiveArtworkCanvas({ url, isHovered, mouseX, mouseY }: {
  url: string;
  isHovered: boolean;
  mouseX: number;
  mouseY: number;
}) {
  const mouseVec = useMemo(() => new THREE.Vector2(0.5, 0.5), []);

  useEffect(() => {
    mouseVec.set(mouseX, mouseY);
  }, [mouseX, mouseY, mouseVec]);

  return (
    <div className="w-full h-full absolute inset-0 z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 2.0], fov: 60 }}
        dpr={[1, 1.2]}
        className="w-full h-full"
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.8} />
        <VolumetricPlane url={url} mouse={mouseVec} isHovered={isHovered} />
      </Canvas>
    </div>
  );
}
