'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture, Float } from '@react-three/drei';
import * as THREE from 'three';

function SlateSlabMesh({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Load artwork texture dynamically
  const texture = useTexture(imageUrl);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} castShadow receiveShadow>
        {/* Box representing a 3D slate slab: Width=3.2, Height=4, Depth=0.2 */}
        <boxGeometry args={[3.2, 4, 0.2]} />
        
        {/* Front Face: The Painting */}
        <meshPhysicalMaterial 
          attach="material-4" 
          map={texture} 
          roughness={0.4} 
          metalness={0.2}
          clearcoat={0.3}
          clearcoatRoughness={0.1}
        />

        {/* Back and Side Faces: Dark Mineral Slate Texture with Kintsugi Gold sheen */}
        <meshPhysicalMaterial 
          attach="material-0" 
          color="#080808" 
          roughness={0.8} 
          metalness={0.9} 
        />
        <meshPhysicalMaterial 
          attach="material-1" 
          color="#080808" 
          roughness={0.8} 
          metalness={0.9} 
        />
        <meshPhysicalMaterial 
          attach="material-2" 
          color="#F59E0B" 
          emissive="#F59E0B"
          emissiveIntensity={0.3}
          roughness={0.2} 
          metalness={1} 
        />
        <meshPhysicalMaterial 
          attach="material-3" 
          color="#080808" 
          roughness={0.8} 
          metalness={0.9} 
        />
        <meshPhysicalMaterial 
          attach="material-5" 
          color="#080808" 
          roughness={0.8} 
          metalness={0.9} 
        />
      </mesh>
    </Float>
  );
}

export default function Slate3DViewer({ imageUrl, title }: { imageUrl: string; title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 px-6 bg-[#050505] border border-[#F59E0B]/40 hover:border-[#F59E0B] text-[#F59E0B] font-mono text-xs tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-3 group shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]"
      >
        <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
        <span>Inspeccionar Relieve 3D en Vivo</span>
        <span className="group-hover:translate-x-1 transition-transform">↗</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6">
          <div className="absolute top-6 right-8 flex items-center gap-6">
            <span className="font-mono text-xs tracking-widest text-[#F59E0B] uppercase">
              Visor Lítico 3D // {title}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-white/20 hover:border-white text-white font-mono text-xs uppercase transition-colors"
            >
              Cerrar ✕
            </button>
          </div>

          <div className="w-full h-[75vh] max-w-4xl relative">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
              <directionalLight position={[-5, -5, -5]} intensity={1} color="#F59E0B" />
              <pointLight position={[0, 0, 3]} intensity={1.5} color="#2B3BE5" />
              
              <React.Suspense fallback={null}>
                <SlateSlabMesh imageUrl={imageUrl} />
              </React.Suspense>
              
              <OrbitControls enableZoom={true} maxDistance={10} minDistance={3} />
            </Canvas>
          </div>

          <p className="font-mono text-[10px] tracking-[0.3em] text-white/50 uppercase mt-4">
            [ Haz clic y arrastra para rotar la losa de pizarra // Rueda para zoom ]
          </p>
        </div>
      )}
    </div>
  );
}
