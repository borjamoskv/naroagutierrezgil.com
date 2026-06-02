'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera, Splat } from '@react-three/drei'
import { Suspense } from 'react'

interface SplatVaultProps {
  isVisible: boolean;
}

export default function SplatVault({ isVisible }: SplatVaultProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[140] bg-[#050505] animate-in fade-in duration-1000">
      <Canvas dpr={[1, 2]} gl={{ antialias: false, alpha: false }}>
        {/* Volumetric / Cinematic Camera */}
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
        
        {/* Cinematic Lighting Setup */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#C6A87C" />
        <spotLight position={[-10, 5, 5]} angle={0.15} penumbra={1} intensity={1} color="#2B3BE5" />
        
        {/* Organic Slate Environment Reflections */}
        <Environment preset="night" />
        
        {/* Controls for Excavation (Restricted movement for physical feel) */}
        <OrbitControls 
          makeDefault 
          enablePan={false} 
          enableZoom={true} 
          minDistance={1} 
          maxDistance={10}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />

        <Suspense fallback={null}>
          {/* 
            [SPLAT INJECTION POINT]
            Drop the Gaussian Splat file (.splat) here when ready.
            Example: <Splat src="/assets/naroa_obra.splat" position={[0, 0, 0]} rotation={[0, 0, 0]} scale={1} />
          */}
          <mesh>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#0a0a0c" roughness={0.9} metalness={0.1} />
          </mesh>
        </Suspense>
      </Canvas>
      
      {/* HUD - Splat Analytics */}
      <div className="absolute top-8 left-8 text-[10px] uppercase tracking-widest text-primary/50 font-sans pointer-events-none">
        <p>Volumetric Rendering [WebGPU/WebGL]</p>
        <p>Awaiting Gaussian Splat Data...</p>
        <p>Camera: Locked (Physical Bound)</p>
      </div>
    </div>
  )
}
