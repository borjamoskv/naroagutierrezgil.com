"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { inSphere } from "maath/random";

function StarBackground(props: any) {
  const ref = useRef<THREE.Points>(null);
  const [color, setColor] = useState("#2B3BE5");
  
  useEffect(() => {
    // Read initial color
    const initialColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    if (initialColor) setColor(initialColor);

    // Poll for changes (since mutation observer on style is tricky)
    const interval = setInterval(() => {
      const newColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      if (newColor && newColor !== color) {
        setColor(newColor);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [color]);

  // Create a sphere of random particles representing "pigment dust" or slate particles
  const [sphere] = useState(() => 
    inSphere(new Float32Array(3000), { radius: 1.5 }) as Float32Array
  );

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color={color}
          size={0.003}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
    </group>
  );
}

export default function WebGLBackground() {
  return (
    <div className="absolute inset-0 z-0 bg-[#0A0A0A]">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <fog attach="fog" args={['#0A0A0A', 0.5, 2]} />
        <StarBackground />
      </Canvas>
    </div>
  );
}
