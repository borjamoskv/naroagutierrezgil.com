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
  const particleTypes = useRef<string[]>([]);
  
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

  const count = 5000;
  const [sphere] = useState(() => 
    inSphere(new Float32Array(count * 3), { radius: 2.0 }) as Float32Array
  );

  // Generate mixed mineral colors (70% base, 20% gold, 10% silver/mica)
  const [colors] = useState(() => {
    const arr = new Float32Array(count * 3);
    const types: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const rand = Math.random();
      if (rand < 0.7) {
        types.push('primary');
        // Initial primary color #2B3BE5
        arr[idx] = 43 / 255;
        arr[idx+1] = 59 / 255;
        arr[idx+2] = 229 / 255;
      } else if (rand < 0.9) {
        types.push('gold');
        // Gold #D4AF37
        arr[idx] = 212 / 255;
        arr[idx+1] = 175 / 255;
        arr[idx+2] = 55 / 255;
      } else {
        types.push('silver');
        // Silver/Mica #EAEAEA
        arr[idx] = 234 / 255;
        arr[idx+1] = 234 / 255;
        arr[idx+2] = 234 / 255;
      }
    }
    particleTypes.current = types;
    return arr;
  });

  // Dynamically update primary particle colors on base color change
  useEffect(() => {
    if (!ref.current) return;
    const geometry = ref.current.geometry;
    const colorAttr = geometry.getAttribute('color') as THREE.BufferAttribute;
    if (!colorAttr) return;
    
    const cleanHex = color.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const colorsArr = colorAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      if (particleTypes.current[i] === 'primary') {
        colorsArr[idx] = r;
        colorsArr[idx+1] = g;
        colorsArr[idx+2] = b;
      }
    }
    colorAttr.needsUpdate = true;
  }, [color]);
  
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
      ref.current.rotation.x -= delta / 22;
      ref.current.rotation.y -= delta / 32;
      
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
      <Points ref={ref} positions={sphere} colors={colors} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          vertexColors
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.65}
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
