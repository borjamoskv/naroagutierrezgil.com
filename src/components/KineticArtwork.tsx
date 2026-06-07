"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform vec2 uHover;
uniform float uHoverState;

void main() {
  vUv = uv;
  vec3 pos = position;
  
  // Respiración orgánica
  float breath = sin(pos.x * 2.0 + uTime * 1.5) * 0.02 * (1.0 - uHoverState);
  pos.z += breath;
  
  // Refracción y distorsión SDF por cursor
  float dist = distance(uv, uHover);
  float effect = exp(-dist * 8.0) * 0.3 * uHoverState;
  pos.z += effect;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uTime;
uniform float uHoverState;
uniform vec3 uPrimaryColor;
uniform vec2 uHover;
uniform float uHeat;

void main() {
  vec2 uv = vUv;
  
  // Distorsión UV basada en cursor
  float dist = distance(uv, uHover);
  float bulge = exp(-dist * 6.0) * uHoverState;
  
  uv.x += bulge * 0.05;
  uv.y += bulge * 0.05;
  
  vec4 texColor = texture2D(uTexture, uv);
  
  // Kintsugi oro / Color primario en el brillo + Radiance Memory
  float heatBoost = min(uHeat * 0.02, 0.8);
  vec3 highlight = uPrimaryColor * (bulge * 1.5 + heatBoost * 0.5);
  vec3 finalColor = mix(texColor.rgb, texColor.rgb + highlight, clamp(bulge * 0.8 + heatBoost, 0.0, 1.0));
  
  gl_FragColor = vec4(finalColor, texColor.a);
}
`;

function ShaderPlane({ textureUrl, heat }: { textureUrl: string, heat: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [primaryColor, setPrimaryColor] = useState(new THREE.Vector3(0.168, 0.231, 0.898));

  useEffect(() => {
    new THREE.TextureLoader().load(textureUrl, (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      setTexture(tex);
    });

    const handleColor = (e: any) => {
      if (e.detail) {
        const color = new THREE.Color(e.detail);
        setPrimaryColor(new THREE.Vector3(color.r, color.g, color.b));
      }
    };
    window.addEventListener("naroa-color-change", handleColor);
    return () => window.removeEventListener("naroa-color-change", handleColor);
  }, [textureUrl]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      const targetHover = state.pointer.x !== 0 || state.pointer.y !== 0 ? 1.0 : 0.0;
      materialRef.current.uniforms.uHoverState.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uHoverState.value,
        targetHover,
        0.1
      );
      const targetVec = new THREE.Vector2((state.pointer.x + 1) / 2, (state.pointer.y + 1) / 2);
      materialRef.current.uniforms.uHover.value.lerp(targetVec, 0.1);
      materialRef.current.uniforms.uHeat.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uHeat.value,
        heat,
        0.05
      );
    }
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef} onPointerOut={(e) => {
      if (e.object instanceof THREE.Mesh && e.object.material instanceof THREE.ShaderMaterial) {
        e.object.material.uniforms.uHoverState.value = 0.0;
      }
    }}>
      <planeGeometry args={[2, 2, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uTexture: { value: texture },
          uHover: { value: new THREE.Vector2(0.5, 0.5) },
          uHoverState: { value: 0 },
          uPrimaryColor: { value: primaryColor },
          uHeat: { value: heat },
        }}
      />
    </mesh>
  );
}

export default function KineticArtwork({
  src,
  alt,
  priority,
  className,
  id,
  onClick,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  id?: string;
  onClick?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [heat, setHeat] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: "100px", threshold: 0 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && id) {
      fetch(`/api/radiance/${id}`)
        .then((res) => res.json())
        .then((data: any) => {
          if (data.heat !== undefined) setHeat(data.heat);
        })
        .catch(() => {});
    }
  }, [isVisible, id]);

  const handleClick = () => {
    if (onClick) onClick();
    if (id) {
      setHeat((h) => h + 1);
      fetch(`/api/radiance/${id}`, { method: "POST" }).catch(() => {});
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full relative cursor-pointer ${className || ""}`}
      onClick={handleClick}
    >
      {/* Fallback & Initial Image */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 80vw"
        quality={80}
        priority={priority}
        className={`object-cover transition-opacity duration-1000 ${isVisible ? "opacity-0" : "opacity-100"}`}
      />
      {isVisible && (
        <div className="absolute inset-0 z-10 animate-[fadeIn_1s_ease-out]">
          <Canvas camera={{ position: [0, 0, 1] }} gl={{ antialias: false, alpha: true }}>
            <ShaderPlane textureUrl={src} heat={heat} />
          </Canvas>
        </div>
      )}
    </div>
  );
}
