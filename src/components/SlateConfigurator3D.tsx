'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

interface SlateConfigurator3DProps {
  width: number; // e.g. 20, 30, 40, 60
  height: number; // e.g. 30, 40, 60, 80
  finish: 'pizarra' | 'mica' | 'kintsugi';
}

function ConfigurableSlab({ width, height, finish }: SlateConfigurator3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Normalize dimensions for 3D viewport (max scale ~ 3.5)
  const scaleX = (width / 40) * 2.2;
  const scaleY = (height / 40) * 2.2;

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  const getFinishProps = () => {
    switch (finish) {
      case 'kintsugi':
        return {
          color: '#080808',
          roughness: 0.5,
          metalness: 0.6,
          emissive: '#F59E0B',
          emissiveIntensity: 0.2,
        };
      case 'mica':
        return {
          color: '#121212',
          roughness: 0.2,
          metalness: 0.9,
          emissive: '#2B3BE5',
          emissiveIntensity: 0.15,
        };
      case 'pizarra':
      default:
        return {
          color: '#050505',
          roughness: 0.85,
          metalness: 0.3,
          emissive: '#000000',
          emissiveIntensity: 0,
        };
    }
  };

  const finishProps = getFinishProps();

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[scaleX, scaleY, 0.15]} />
        <meshPhysicalMaterial 
          color={finishProps.color} 
          roughness={finishProps.roughness} 
          metalness={finishProps.metalness}
          emissive={finishProps.emissive}
          emissiveIntensity={finishProps.emissiveIntensity}
          clearcoat={finish === 'kintsugi' ? 0.6 : 0.1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </Float>
  );
}

export default function SlateConfigurator3D({ width, height, finish }: SlateConfigurator3DProps) {
  return (
    <div className="w-full h-[280px] bg-[#050505] border border-white/10 rounded-sm relative overflow-hidden shadow-2xl">
      <div className="absolute top-3 left-4 z-10 font-mono text-[9px] tracking-widest text-[#F59E0B] uppercase font-bold flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
        <span>Previsualizador 3D de Lienzo ({width}x{height} cm)</span>
      </div>

      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 4, 4]} intensity={2} color="#ffffff" />
        <directionalLight position={[-4, -4, -4]} intensity={1} color="#F59E0B" />
        <pointLight position={[0, 0, 2]} intensity={1.2} color="#2B3BE5" />
        
        <ConfigurableSlab width={width} height={height} finish={finish} />
        
        <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />
      </Canvas>

      <div className="absolute bottom-2 right-3 z-10 font-mono text-[8px] tracking-widest text-white/40 uppercase">
        [ Rotación Libre 3D ]
      </div>
    </div>
  );
}
