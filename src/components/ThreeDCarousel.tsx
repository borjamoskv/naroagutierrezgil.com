'use client';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

interface CarouselItem {
  src: string;
  title: string;
}

const carouselArtworks: CarouselItem[] = [
  { src: '/assets/el-gran-dakari-C1tAWAhR.webp', title: 'El Gran Dakari' },
  { src: '/assets/geisha-MfRtKWdu.webp', title: 'Geisha' },
  { src: '/assets/hq-james-CjsTrO7r.webp', title: 'James Dean' },
  { src: '/assets/hq-amy-BRTriASV.webp', title: 'Amy Winehouse' },
  { src: '/assets/lagrimas-de-oro-DikHc-Tk.webp', title: 'Lágrimas de Oro' },
  { src: '/assets/la-pensadora-CFHSnMA0.webp', title: 'La Pensadora' }
];

function SlateCard({ url, title, index, count, activeIndex, setActiveIndex }: {
  url: string;
  title: string;
  index: number;
  count: number;
  activeIndex: number;
  setActiveIndex: (idx: number) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, url);
  const [hovered, setHovered] = useState(false);

  // Position on a circle
  const angle = (index / count) * Math.PI * 2;
  const radius = 2.4;

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Standard positioning
    const currentAngle = angle + (state.clock.getElapsedTime() * 0.05);
    const targetX = Math.sin(currentAngle) * radius;
    const targetZ = Math.cos(currentAngle) * radius;

    // Smooth lerp to position
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, delta * 4);
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, delta * 4);
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      hovered ? 0.2 : 0,
      delta * 4
    );

    // Look at center slightly rotated
    meshRef.current.lookAt(0, 0, 0);

    // Subtle tilting on hover
    if (hovered) {
      meshRef.current.rotation.y += Math.sin(state.clock.getElapsedTime() * 4) * 0.05;
      meshRef.current.rotation.x += Math.cos(state.clock.getElapsedTime() * 4) * 0.03;
    }
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => {
        setHovered(true);
        setActiveIndex(index);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={() => setActiveIndex(index)}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1.2, 1.6, 0.05]} />
      {/* Front Face (Artwork), sides and back (Slate texture/dark rock) */}
      <meshStandardMaterial
        attach="material-4" // Front material
        map={texture}
        roughness={0.2}
        metalness={0.1}
      />
      <meshStandardMaterial
        attach="material-0" // Side
        color="#151517"
        roughness={0.9}
      />
      <meshStandardMaterial
        attach="material-1" // Side
        color="#151517"
        roughness={0.9}
      />
      <meshStandardMaterial
        attach="material-2" // Top
        color="#151517"
        roughness={0.9}
      />
      <meshStandardMaterial
        attach="material-3" // Bottom
        color="#151517"
        roughness={0.9}
      />
      <meshStandardMaterial
        attach="material-5" // Back
        color="#0a0a0c"
        roughness={0.95}
      />
    </mesh>
  );
}

function FloatingLights() {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(state.clock.getElapsedTime()) * 3;
      lightRef.current.position.y = Math.cos(state.clock.getElapsedTime() * 0.5) * 2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      <pointLight ref={lightRef} distance={8} intensity={4} color="#2B3BE5" />
    </>
  );
}

export default function ThreeDCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative z-10 w-full py-24 bg-black border-t border-white/5 overflow-hidden flex flex-col items-center">
      <div className="max-w-7xl mx-auto w-full px-6 mb-12 text-center">
        <span className="text-primary/70 font-sans tracking-[0.4em] uppercase text-[9px] mb-2 block">
          Arqueología Virtual 3D
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif font-light tracking-wide text-foreground uppercase">
          Galería Tridimensional
        </h2>
        <p className="max-w-xl mx-auto text-foreground/40 font-sans text-xs tracking-wider mt-4 leading-relaxed">
          Interactúa directamente con las pizarras tridimensionales flotantes. Pasa el cursor para ver detalles u orbita a través de la instalación.
        </p>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-[500px] relative cursor-grab active:cursor-grabbing">
        {/* Glow halo behind canvas */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(43,59,229,0.08)_0%,transparent_60%)] pointer-events-none z-0" />
        
        <Canvas
          camera={{ position: [0, 0, 4.5], fov: 60 }}
          dpr={[1, 1.5]}
          shadows
          className="z-10"
        >
          <FloatingLights />
          {carouselArtworks.map((art, idx) => (
            <SlateCard
              key={art.src}
              url={art.src}
              title={art.title}
              index={idx}
              count={carouselArtworks.length}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
            />
          ))}
        </Canvas>

        {/* Selected Art Overlay HUD */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-black/60 backdrop-blur-md border border-white/10 px-6 py-3 rounded-sm flex flex-col items-center gap-1">
          <span className="text-primary font-mono text-[8px] tracking-[0.3em] uppercase">
            Slab #{activeIndex + 1}
          </span>
          <span className="text-white font-serif tracking-widest text-sm uppercase">
            {carouselArtworks[activeIndex].title}
          </span>
        </div>
      </div>
    </section>
  );
}
