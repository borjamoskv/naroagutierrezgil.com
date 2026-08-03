'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Image, Text, Float } from '@react-three/drei';
import { artworkData } from '@/lib/artworkData';
import * as THREE from 'three';

function GalleryRoom() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.15) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Dark Ambient Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#070709" roughness={0.9} metalness={0.2} />
      </mesh>

      {/* Artworks Hanging in 3D Semi-Circle */}
      {artworkData.slice(0, 6).map((art, idx) => {
        const angle = (idx / 6) * Math.PI * 1.4 - Math.PI * 0.7;
        const radius = 9;
        const x = Math.sin(angle) * radius;
        const z = -Math.cos(angle) * radius + 2;

        return (
          <group key={art.id} position={[x, 0.5, z]} rotation={[0, -angle, 0]}>
            {/* Spotlight directly on artwork */}
            <spotLight
              position={[0, 4, 3]}
              angle={0.4}
              penumbra={0.8}
              intensity={12}
              color="#FAF8F5"
              castShadow
            />
            {/* Slate Slab Frame */}
            <mesh position={[0, 0, -0.05]} castShadow>
              <boxGeometry args={[2.6, 3.4, 0.1]} />
              <meshStandardMaterial color="#141416" roughness={0.8} metalness={0.4} />
            </mesh>
            {/* Artwork Image */}
            <Image
              url={art.image}
              scale={[2.4, 3.2]}
              transparent
              opacity={0.95}
              position={[0, 0, 0.01]}
            />
            {/* Kintsugi Gold Border Glow */}
            <mesh position={[0, 0, -0.04]}>
              <planeGeometry args={[2.7, 3.5]} />
              <meshBasicMaterial color="#F59E0B" transparent opacity={0.15} />
            </mesh>
            {/* Artwork Label */}
            <Text
              position={[0, -2, 0]}
              fontSize={0.18}
              color="#A3A3A3"
              anchorX="center"
              anchorY="top"
              font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhRib2Atz4s.woff2"
            >
              {`${art.title}\n(${art.year}) — ${art.dimensions}`}
            </Text>
          </group>
        );
      })}

      {/* Floating Ambient Mineral Particles */}
      {Array.from({ length: 45 }).map((_, i) => (
        <Float key={i} speed={1.5} rotationIntensity={1} floatIntensity={2}>
          <mesh
            position={[
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 10,
              (Math.random() - 0.5) * 20,
            ]}
          >
            <dodecahedronGeometry args={[0.04, 0]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? '#F59E0B' : '#2B3BE5'}
              emissive={i % 3 === 0 ? '#F59E0B' : '#2B3BE5'}
              emissiveIntensity={1.5}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export const VirtualExhibition3D: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <div className="w-full my-12 text-center">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#141417] border border-[#F59E0B]/30 hover:border-[#F59E0B] text-white text-xs md:text-sm uppercase tracking-widest transition-all duration-300 shadow-lg shadow-black/50 hover:shadow-[#F59E0B]/20"
        >
          <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
          Ingresar al Modo Exposición 3D (Galería Virtual SOTD)
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#050507] flex flex-col">
      {/* Header Controls */}
      <div className="flex justify-between items-center px-8 py-4 border-b border-white/10 bg-[#0A0A0C]/80 backdrop-blur-md">
        <div>
          <h3 className="text-white text-sm uppercase tracking-widest font-medium">
            Galería Virtual 3D — Modo Exposición
          </h3>
          <p className="text-xs text-neutral-400 font-light">
            Arrastra para rotar la cámara 360° | Rueda para zoom
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-widest transition"
        >
          ✕ Salir de la Exposición
        </button>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 0.5, 6], fov: 50 }}>
          <color attach="background" args={['#050507']} />
          <ambientLight intensity={0.4} />
          <pointLight position={[0, 8, 0]} intensity={10} color="#F59E0B" />
          <GalleryRoom />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            minDistance={3}
            maxDistance={14}
            maxPolarAngle={Math.PI / 2 + 0.1}
          />
        </Canvas>
      </div>
    </div>
  );
};
