'use client';

import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

import { artworksData as allArtworksData, Hotspot } from '@/data/artworks';

const artworksData = allArtworksData
  .filter(art => ['james', 'lagrimas', 'dakari'].includes(art.id))
  .map(art => ({
    ...art,
    src: '/assets/' + art.src,
    material: art.material || '',
    year: art.year || '',
    audioTitle: art.audioTitle || '',
    hotspots: art.hotspots || []
  }));

function InteractiveCanvasModel({ src, hotspots, activeHotspot, setActiveHotspot, rotationY, setRotationY }: {
  src: string;
  hotspots: Hotspot[];
  activeHotspot: Hotspot | null;
  setActiveHotspot: (h: Hotspot | null) => void;
  rotationY: number;
  setRotationY: (y: number) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, src);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (texture) {
      // eslint-disable-next-line react-hooks/immutability
      texture.minFilter = THREE.LinearFilter;
    }
  }, [texture]);

  // Handle auto-rotation decay or user interaction updates
  useFrame((state, delta) => {
    if (meshRef.current && !isDragging.current) {
      // Lerp current mesh rotation to target rotationY set by button controls or dragging
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, rotationY, delta * 5);
      
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.8) * 0.05;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.03;
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onPointerDown={(e) => {
          isDragging.current = true;
          previousMousePosition.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={() => {
          isDragging.current = false;
        }}
        onPointerMove={(e) => {
          if (isDragging.current && meshRef.current) {
            const deltaX = e.clientX - previousMousePosition.current.x;
            const newRotY = rotationY + deltaX * 0.01;
            setRotationY(newRotY);
            meshRef.current.rotation.y = newRotY;
            previousMousePosition.current = { x: e.clientX, y: e.clientY };
          }
        }}
      >
        {/* Box geometry representing the heavy slate slab */}
        <boxGeometry args={[1.6, 2.0, 0.06]} />
        
        {/* Left Side */}
        <meshStandardMaterial attach="material-0" color="#141416" roughness={0.9} />
        {/* Right Side */}
        <meshStandardMaterial attach="material-1" color="#141416" roughness={0.9} />
        {/* Top Side */}
        <meshStandardMaterial attach="material-2" color="#1c1c1e" roughness={0.9} />
        {/* Bottom Side */}
        <meshStandardMaterial attach="material-3" color="#111113" roughness={0.9} />
        
        {/* Front Face (Artwork) */}
        <meshStandardMaterial 
          attach="material-4" 
          map={texture} 
          roughness={0.4} 
          metalness={0.2}
        />
        
        {/* Back Face (Natural slate backing + signature + QR code symbol) */}
        <meshStandardMaterial 
          attach="material-5" 
          color="#0d0d0f" 
          roughness={0.95} 
          metalness={0.1}
        />

        {/* Hotspots represented as interactive HTML elements in 3D */}
        {hotspots.map((hotspot) => {
          // Calculate if the hotspot is facing the camera based on rotation
          const currentRotation = rotationY % (Math.PI * 2);
          const absRot = Math.abs(currentRotation);
          const isFacingFront = (absRot < Math.PI / 2) || (absRot > Math.PI * 1.5);
          const showHotspot = (hotspot.side === 'front' && isFacingFront) || (hotspot.side === 'back' && !isFacingFront);

          if (!showHotspot) return null;

          return (
            <Html
              key={hotspot.id}
              position={[hotspot.x, hotspot.y, hotspot.z]}
              center
              distanceFactor={3.2}
              className="pointer-events-auto"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHotspot(activeHotspot?.id === hotspot.id ? null : hotspot);
                }}
                className={`w-6 h-6 rounded-full flex items-center justify-center border font-mono text-[9px] font-bold cursor-pointer transition-all duration-300 ${
                  activeHotspot?.id === hotspot.id
                    ? 'bg-[#2B3BE5] border-[#2B3BE5] text-white scale-125 shadow-[0_0_15px_#2B3BE5]'
                    : 'bg-black/80 border-white/40 text-white/80 hover:border-[#2B3BE5] hover:text-[#2B3BE5]'
                }`}
              >
                +
              </button>
            </Html>
          );
        })}
      </mesh>
    </group>
  );
}

export default function LuxuryArtworkViewer() {
  const [selectedArtworkIndex, setSelectedArtworkIndex] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [rotationY, setRotationY] = useState(0);


  const artwork = artworksData[selectedArtworkIndex];

  // Sync audio reference on artwork change
  useEffect(() => {
    const timeout = setTimeout(() => {
      setActiveHotspot(null);
      setRotationY(0); // Reset rotation to front view
    }, 0);
    return () => clearTimeout(timeout);
  }, [selectedArtworkIndex]);



  // Manual rotation controls
  const rotateFront = () => setRotationY(0);
  const rotateBack = () => setRotationY(Math.PI);

  const isBackView = Math.abs(rotationY % (Math.PI * 2)) > Math.PI / 2 && Math.abs(rotationY % (Math.PI * 2)) < Math.PI * 1.5;

  return (
    <section id="alcova-detalles" className="relative z-10 py-32 px-6 sm:px-12 bg-[#080808] border-t border-white/5 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[50vw] h-[50vw] bg-[#2B3BE5]/5 rounded-full filter blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] bg-[#F59E0B]/3 rounded-full filter blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        
        {/* Title Block */}
        <div className="mb-20 text-center flex flex-col items-center">
          <span className="text-[#2B3BE5] font-mono tracking-[0.4em] text-[9px] uppercase mb-3">
            Exploración de la Materia · Savoir-Faire
          </span>
          <h2 className="text-4xl sm:text-6xl font-brutal-title text-white">
            El Arte en Detalle
          </h2>
          <div className="w-12 h-[1px] bg-white/20 mt-6" />
        </div>

        {/* Artwork Selector Grid Header */}
        <div className="flex justify-center gap-4 sm:gap-8 mb-16 border-b border-white/5 pb-4 max-w-lg mx-auto">
          {artworksData.map((art, idx) => (
            <button
              key={art.id}
              onClick={() => setSelectedArtworkIndex(idx)}
              className={`font-mono text-[9px] sm:text-[10px] tracking-widest uppercase pb-3 transition-all duration-300 border-b cursor-pointer ${
                idx === selectedArtworkIndex
                  ? 'border-[#2B3BE5] text-white font-bold'
                  : 'border-transparent text-white/40 hover:text-white/80'
              }`}
            >
              {art.title}
            </button>
          ))}
        </div>

        {/* main interactive columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Column 1: Info & Hotspots details */}
          <div className="lg:col-span-4 flex flex-col order-2 lg:order-1">
            <div className="border-l border-[#2B3BE5]/40 pl-6 mb-8">
              <span className="text-white/40 font-mono text-[9px] tracking-widest uppercase">
                {artwork.material} / {artwork.year}
              </span>
              <h3 className="text-3xl font-serif font-black text-white uppercase mt-2">
                {artwork.title}
              </h3>
            </div>

            {/* Dynamic details card based on active hotspot */}
            <div className="min-h-[220px] bg-black/40 backdrop-blur-md border border-white/10 p-8 rounded-sm relative shadow-2xl flex flex-col justify-center">
              {activeHotspot ? (
                <div className="animate-[fadeIn_0.5s_ease-out]">
                  <span className="text-[#2B3BE5] font-mono text-[9px] tracking-widest uppercase block mb-2">
                    Detalle: {activeHotspot.title}
                  </span>
                  <p className="text-white/80 font-sans text-sm leading-relaxed">
                    {activeHotspot.description}
                  </p>
                </div>
              ) : (
                <div className="text-center py-6 text-white/30 font-mono text-[10px] tracking-widest uppercase">
                  [ Haz clic en los puntos interactivos (+) sobre el lienzo para explorar los detalles de la obra ]
                </div>
              )}
            </div>

            {/* Rotate control buttons (Front / Back view) */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={rotateFront}
                className={`flex-1 py-3.5 border font-mono text-[9px] tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                  !isBackView
                    ? 'border-[#2B3BE5] bg-[#2B3BE5]/10 text-white font-bold'
                    : 'border-white/10 hover:border-white/30 text-white/60'
                }`}
              >
                Ver Anverso
              </button>
              <button
                onClick={rotateBack}
                className={`flex-1 py-3.5 border font-mono text-[9px] tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                  isBackView
                    ? 'border-[#2B3BE5] bg-[#2B3BE5]/10 text-white font-bold'
                    : 'border-white/10 hover:border-white/30 text-white/60'
                }`}
              >
                Ver Reverso (QR)
              </button>
            </div>
          </div>

          {/* Column 2: 3D interactive Canvas */}
          <div className="lg:col-span-5 h-[500px] sm:h-[600px] w-full relative order-1 lg:order-2 flex justify-center items-center">
            {/* 3D Canvas wrapper */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(43,59,229,0.04)_0%,transparent_70%)] pointer-events-none" />
            
            <div className="w-full h-full cursor-grab active:cursor-grabbing relative z-10">
              <Canvas
                camera={{ position: [0, 0, 3.2], fov: 50 }}
                dpr={[1, 1.5]}
                shadows
              >
                <ambientLight intensity={0.6} />
                <directionalLight position={[3, 5, 2]} intensity={1.2} castShadow />
                <directionalLight position={[-3, -2, -2]} intensity={0.5} />
                <pointLight position={[0, 2, 4]} intensity={0.8} />
                
                <InteractiveCanvasModel
                  src={artwork.src}
                  hotspots={artwork.hotspots}
                  activeHotspot={activeHotspot}
                  setActiveHotspot={setActiveHotspot}
                  rotationY={rotationY}
                  setRotationY={setRotationY}
                />
              </Canvas>
            </div>

            {/* Parallax instruction helper */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[8px] tracking-[0.2em] text-white/30 pointer-events-none uppercase">
              Arrastra para girar el soporte
            </div>
          </div>



        </div>

      </div>
    </section>
  );
}
