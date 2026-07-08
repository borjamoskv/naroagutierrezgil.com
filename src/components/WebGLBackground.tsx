
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { inSphere } from "maath/random";

function StarBackground(props: Record<string, unknown>) {
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

  const count = 5000;
  const [sphere] = useState(() => 
    inSphere(new Float32Array(count * 3), { radius: 2.0 }) as Float32Array
  );

  // Deterministic particle type generator based on index to avoid storing in ref during render
  const getParticleType = (i: number): 'primary' | 'gold' | 'silver' => {
    const x = Math.sin(i + 1) * 10000;
    const rand = x - Math.floor(x);
    if (rand < 0.7) return 'primary';
    if (rand < 0.9) return 'gold';
    return 'silver';
  };

  // Generate mixed mineral colors (70% base, 20% gold, 10% silver/mica)
  const [colors] = useState(() => {
    const arr = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const type = getParticleType(i);
      if (type === 'primary') {
        arr[idx] = 43 / 255;
        arr[idx+1] = 59 / 255;
        arr[idx+2] = 229 / 255;
      } else if (type === 'gold') {
        arr[idx] = 212 / 255;
        arr[idx+1] = 175 / 255;
        arr[idx+2] = 55 / 255;
      } else {
        arr[idx] = 234 / 255;
        arr[idx+1] = 234 / 255;
        arr[idx+2] = 234 / 255;
      }
    }
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
      if (getParticleType(i) === 'primary') {
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
      const mx = mouse.current.x * 2;
      const my = mouse.current.y * 2;
      const mz = 0;
      
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        let px = positions[idx];
        let py = positions[idx+1];
        let pz = positions[idx+2];

        const dx = px - mx;
        const dy = py - my;
        const dz = pz - mz;
        const distSq = dx*dx + dy*dy + dz*dz;
        
        if (distSq < 1.0) {
          const dist = Math.sqrt(distSq);
          const lerpFactor = delta * 0.5 * (1 - dist);
          px += (mx - px) * lerpFactor;
          py += (my - py) * lerpFactor;
          pz += (mz - pz) * lerpFactor;
        } else {
          const originDistSq = px*px + py*py + pz*pz;
          if (originDistSq < 3.61) {
            const factor = 1 + delta * 0.1;
            px *= factor; py *= factor; pz *= factor;
          } else if (originDistSq > 4.41) {
            const factor = 1 - delta * 0.1;
            px *= factor; py *= factor; pz *= factor;
          }
        }
        
        positions[idx] = px;
        positions[idx+1] = py;
        positions[idx+2] = pz;
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
