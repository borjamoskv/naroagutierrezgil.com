/* eslint-disable @typescript-eslint/no-explicit-any */
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
    const initialColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    if (initialColor) {
      setTimeout(() => setColor(initialColor), 0);
    }

    const handleColorChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setColor(customEvent.detail);
      }
    };

    window.addEventListener('naroa-color-change', handleColorChange);
    return () => {
      window.removeEventListener('naroa-color-change', handleColorChange);
    };
  }, []);

  // Create a sphere of random particles representing "pigment dust" or slate particles
  const count = 5000;
  const [sphere] = useState(() => 
    inSphere(new Float32Array(count * 3), { radius: 2.0 }) as Float32Array
  );
  
  const mouse = useRef(new THREE.Vector2(0, 0));
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 20;
      ref.current.rotation.y -= delta / 30;
      
      // Interactive gravity well towards mouse
      const positions = ref.current.geometry.attributes.position.array as Float32Array;
      const mouseVec = new THREE.Vector3(mouse.current.x * 2, mouse.current.y * 2, 0);
      
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        const p = new THREE.Vector3(positions[idx], positions[idx+1], positions[idx+2]);
        const dist = p.distanceTo(mouseVec);
        
        if (dist < 1.0) {
          p.lerp(mouseVec, delta * 0.5 * (1 - dist));
          positions[idx] = p.x;
          positions[idx+1] = p.y;
          positions[idx+2] = p.z;
        } else {
          // Slow recovery back to orbit radius (simplified)
          const originDist = p.length();
          if (originDist < 1.9) p.multiplyScalar(1 + delta * 0.1);
          if (originDist > 2.1) p.multiplyScalar(1 - delta * 0.1);
          positions[idx] = p.x;
          positions[idx+1] = p.y;
          positions[idx+2] = p.z;
        }
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color={color}
          size={0.005}
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
      <Canvas 
        camera={{ position: [0, 0, 1] }} 
        dpr={[1, 1.5]} 
        gl={{ powerPreference: "high-performance", alpha: false, antialias: false }}
      >
        <fog attach="fog" args={['#0A0A0A', 0.5, 2]} />
        <StarBackground />
      </Canvas>
    </div>
  );
}
