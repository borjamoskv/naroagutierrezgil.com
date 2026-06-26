
"use client";

// C5-REAL: WebGPU Background Stars — TSL/WebGPU Architecture
// Credits: Borja Moskv (borjamoskv) / MOSKV-1 APEX
// Migrated from CPU-bound particle physics to WebGPU Canvas.
// The particle update logic (mouse attraction, boundary constraints)
// still runs on CPU via useFrame since the particle count (5k) is
// well within CPU budget and the Drei <Points> component handles
// rendering efficiently. Full GPU compute migration to TSL storage
// buffers would be warranted at 50k+ particles.

import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useState, useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { inSphere } from "maath/random";
import WebGPUCanvas from "./WebGPUCanvas";

import { storage, Fn, instanceIndex, float, vec3, deltaTime, dot, length, If, uniform, vec2 } from 'three/tsl';
import { PointsNodeMaterial } from 'three/webgpu';

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
  
  // Storage Buffer Attributes for Compute Shader
  const [positionAttr] = useState(() => {
    const sphere = inSphere(new Float32Array(count * 3), { radius: 2.0 }) as Float32Array;
    // @ts-ignore - StorageBufferAttribute is available in three/webgpu or three r171
    return new THREE.StorageBufferAttribute(sphere, 3);
  });
  
  const [colorAttr] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = Math.sin(i + 1) * 10000;
      const rand = x - Math.floor(x);
      const idx = i * 3;
      if (rand < 0.7) { // primary
        arr[idx] = 43 / 255; arr[idx+1] = 59 / 255; arr[idx+2] = 229 / 255;
      } else if (rand < 0.9) { // gold
        arr[idx] = 212 / 255; arr[idx+1] = 175 / 255; arr[idx+2] = 55 / 255;
      } else { // silver
        arr[idx] = 234 / 255; arr[idx+1] = 234 / 255; arr[idx+2] = 234 / 255;
      }
    }
    return new THREE.BufferAttribute(arr, 3);
  });

  // Dynamically update primary particle colors on base color change
  useEffect(() => {
    const cleanHex = color.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const colorsArr = colorAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const x = Math.sin(i + 1) * 10000;
      const rand = x - Math.floor(x);
      if (rand < 0.7) {
        colorsArr[i * 3] = r;
        colorsArr[i * 3 + 1] = g;
        colorsArr[i * 3 + 2] = b;
      }
    }
    colorAttr.needsUpdate = true;
  }, [color, colorAttr]);
  
  const mouseUniform = useMemo(() => uniform(vec2(0, 0)), []);
  const mouse = useRef(new THREE.Vector2(0, 0));
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Define TSL Compute Node for particle physics
  const computeNode = useMemo(() => {
    const computeParticles = Fn(() => {
      const position = storage(positionAttr as any, 'vec3', count).element(instanceIndex);
      
      const mx = mouseUniform.x.mul(2.0);
      const my = mouseUniform.y.mul(2.0);
      const mouseVec = vec3(mx, my, float(0.0));
      
      const diff = mouseVec.sub(position);
      const distSq = dot(diff, diff);
      const delta = deltaTime;
      
      If(distSq.lessThan(1.0), () => {
        const dist = length(diff);
        const lerpFactor = delta.mul(0.5).mul(float(1.0).sub(dist));
        position.addAssign(diff.mul(lerpFactor));
      }).Else(() => {
        const originDistSq = dot(position, position);
        If(originDistSq.lessThan(3.61), () => {
          const factor = float(1.0).add(delta.mul(0.1));
          position.mulAssign(factor);
        }).ElseIf(originDistSq.greaterThan(4.41), () => {
          const factor = float(1.0).sub(delta.mul(0.1));
          position.mulAssign(factor);
        });
      });
    });
    return computeParticles().compute(count);
  }, [positionAttr, mouseUniform, count]);

  // Execute Compute Shader in Render Loop
  useFrame((state, delta) => {
    mouseUniform.value.x = mouse.current.x;
    mouseUniform.value.y = mouse.current.y;
    
    if (ref.current) {
      ref.current.rotation.x -= delta / 22;
      ref.current.rotation.y -= delta / 32;
    }
    
    // Dispatch GPU compute manually since WebGPURenderer is active
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void (state.gl as any).computeAsync(computeNode);
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <points ref={ref} frustumCulled={false} {...props}>
        <bufferGeometry>
          <primitive object={positionAttr} attach="attributes-position" />
          <primitive object={colorAttr} attach="attributes-color" />
        </bufferGeometry>
        {/* @ts-ignore - PointsNodeMaterial not natively typed in R3F yet */}
        <pointsNodeMaterial
          transparent
          vertexColors
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.65}
        />
      </points>
    </group>
  );
}

export default function WebGLBackground() {
  return (
    <div className="absolute inset-0 z-0 bg-[#0A0A0A]">
      <WebGPUCanvas 
        camera={{ position: [0, 0, 1] }} 
        dpr={[1, 1.5]}
      >
        <fog attach="fog" args={['#0A0A0A', 0.5, 2]} />
        <StarBackground />
      </WebGPUCanvas>
    </div>
  );
}
