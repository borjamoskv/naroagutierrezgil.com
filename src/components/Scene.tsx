import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload, PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Noise, Vignette, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

import { Gallery } from './Gallery'
import { FirstPersonController } from './FirstPersonController'
import { EnvironmentLevel } from './EnvironmentLevel'

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const isMobile =
  typeof window !== 'undefined' &&
  (window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent))

interface SceneProps {
  onCurrentChange?: (index: number) => void // Opcional, ya que no usamos scroll carousel
  onInspectArtwork: (index: number) => void
  targetIndex?: number | null // Opcional
  active?: boolean
  setInteractionPrompt: (prompt: string | null) => void
  isStarted: boolean
  onPlayerMove?: (pos: { x: number; z: number }, rot: number) => void
}

export default function Scene({ onInspectArtwork, active = true, setInteractionPrompt, isStarted, onPlayerMove }: SceneProps) {
  const [dpr, setDpr] = useState(isMobile ? 1 : 1.5)

  // Use frameloop='always' to support FPS movement smoothly.
  const frameloop = active ? 'always' : 'demand'

  return (
    <Canvas 
      dpr={dpr} 
      frameloop={frameloop}
      gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, powerPreference: 'high-performance' }}
      camera={{ position: [0, 1.7, 0], fov: 75 }} // FOV más amplio para sensación FPS
    >
      <PerformanceMonitor onIncline={() => setDpr(isMobile ? 1.5 : 2)} onDecline={() => setDpr(1)}>
      <color attach="background" args={['#030305']} />
      <fog attach="fog" args={['#030305', 10, 30]} />

      <Suspense fallback={null}>
        
        {/* Controles FPS, activados solo cuando isStarted es true */}
        {isStarted && <FirstPersonController onPlayerMove={onPlayerMove} />}

        {/* Nivel / Entorno (Suelo Grid) */}
        <EnvironmentLevel />

        {/* Galería (Obras distribuidas en círculo y Raycaster) */}
        <Gallery
          onInspectArtwork={onInspectArtwork}
          reducedMotion={prefersReducedMotion}
          setInteractionPrompt={setInteractionPrompt}
          isStarted={isStarted}
        />

        <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
        <pointLight position={[-10, 5, -10]} intensity={1.2} color="#2B3BE5" />
        <spotLight position={[0, 15, 0]} angle={0.8} penumbra={1} intensity={2} color="#D4AF37" />

        {!prefersReducedMotion && !isMobile && (
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.2} />
            <Noise opacity={0.025} />
            <Vignette eskil={false} offset={0.15} darkness={0.95} />
            <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.0015, 0.0015)} />
          </EffectComposer>
        )}

        <Preload all />
      </Suspense>
      </PerformanceMonitor>
    </Canvas>
  )
}
