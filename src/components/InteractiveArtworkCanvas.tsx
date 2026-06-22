'use client';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

// Shaders for individual artwork interaction in the gallery grid
// Credits: Borja Moskv (borjamoskv) / MOSKV-1 APEX
const kineticVertexShader = `
  uniform float uTime;
  uniform float uHover;
  uniform vec2 uMouse;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Wave deformation representing resin/slate fluid elasticity
    float dist = distance(uv, uMouse);
    float force = smoothstep(0.3, 0.0, dist);
    
    // Liquid ripple effect under the mouse
    pos.z += sin(dist * 20.0 - uTime * 4.0) * 0.015 * force * uHover;
    
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
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Subtle lens distortion refraction centered at the cursor
    float dist = distance(uv, uMouse);
    float force = smoothstep(0.25, 0.0, dist);
    vec2 offsetDir = normalize(uv - uMouse);
    if (dist > 0.001) {
      uv -= offsetDir * sin(dist * 6.28) * 0.012 * force * uHover;
    }
    
    vec4 texColor = texture2D(uTexture, uv);
    
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    // Virtual point light floating above the cursor
    vec3 lightPos = vec3(uMouse.x - 0.5, uMouse.y - 0.5, 0.35);
    vec3 surfacePos = vec3(vUv.x - 0.5, vUv.y - 0.5, 0.0);
    vec3 lightDir = normalize(lightPos - surfacePos);
    
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 32.0);
    
    // Mica mineral sparkles (procedural high-frequency noise)
    float micaFrequency = 220.0;
    float micaNoise = hash(floor(vUv * micaFrequency));
    float micaSparkle = 0.0;
    if (micaNoise > 0.96) {
      float angleFactor = max(dot(normal, halfDir), 0.0);
      float blink = 0.4 + 0.6 * sin(uTime * (2.0 + micaNoise * 3.0) + micaNoise * 15.0);
      micaSparkle = pow(angleFactor, 64.0) * blink * uHover * 2.0;
    }
    
    // Golden accent color
    vec3 goldColor = vec3(0.96, 0.72, 0.2);
    
    // Ambient shadows & lighting
    vec3 ambient = texColor.rgb * 0.6;
    vec3 diffuseColor = texColor.rgb * diff * 0.5;
    vec3 specularColor = vec3(1.0) * spec * 0.25 * uHover;
    
    vec3 finalColor = ambient + diffuseColor + specularColor;
    
    // Inject sparkles
    finalColor += goldColor * micaSparkle;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function VolumetricPlane({ url, mouse, isHovered }: { url: string; mouse: THREE.Vector2; isHovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const texture = useLoader(THREE.TextureLoader, url);

  const uniforms = useMemo(() => ({
    uTexture: { value: null as THREE.Texture | null },
    uTime: { value: 0.0 },
    uMouse: { value: mouse },
    uHover: { value: 0.0 }
  }), [mouse]);

  useEffect(() => {
    if (texture) {
      texture.minFilter = THREE.LinearFilter;
      if (materialRef.current) {
        materialRef.current.uniforms.uTexture.value = texture;
      }
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
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2.0, 2.5, 32, 32]} />
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
