import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Preload, PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Noise, Vignette, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

import { Gallery } from './Gallery'
import { FirstPersonController } from './FirstPersonController'
import { OrbitGalleryController } from './OrbitGalleryController'
import { EnvironmentLevel } from './EnvironmentLevel'
import { MicaParticles } from './MicaParticles'

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const isMobile =
  typeof window !== 'undefined' &&
  (window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent))

interface SceneProps {
  onInspectArtwork: (index: number) => void
  active?: boolean
  setInteractionPrompt: (prompt: string | null) => void
  isStarted: boolean
  cameraMode?: 'fps' | 'orbit'
  onPlayerMove?: (pos: { x: number; z: number }, rot: number) => void
}

export default function Scene({
  onInspectArtwork,
  active = true,
  setInteractionPrompt,
  isStarted,
  cameraMode = 'fps',
  onPlayerMove
}: SceneProps) {
  const [dpr, setDpr] = useState(isMobile ? 1 : 1.5)

  const frameloop = active ? 'always' : 'demand'

  return (
    <Canvas
      dpr={dpr}
      frameloop={frameloop}
      gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping, powerPreference: 'high-performance' }}
      camera={{ position: [0, 1.7, 0], fov: 75 }}
    >
      <PerformanceMonitor onIncline={() => setDpr(isMobile ? 1.5 : 2)} onDecline={() => setDpr(1)}>
        <color attach="background" args={['#030305']} />
        <fog attach="fog" args={['#030305', 6, 28]} />

        <Suspense fallback={null}>
          {/* Alternar entre Controlador FPS WASD y Controlador Órbita 3D */}
          {isStarted && (cameraMode === 'orbit' ? <OrbitGalleryController /> : <FirstPersonController onPlayerMove={onPlayerMove} />)}

          {/* Entorno PBR de Pizarra Vasca y Columnas */}
          <EnvironmentLevel />

          {/* Partículas GPU de Mica Mineral y Pan de Oro */}
          <MicaParticles count={isMobile ? 80 : 160} />

          {/* Galería 3D de Cuadros y Marcos con Reverso Acústico */}
          <Gallery
            onInspectArtwork={onInspectArtwork}
            reducedMotion={prefersReducedMotion}
            setInteractionPrompt={setInteractionPrompt}
            isStarted={isStarted}
          />

          <directionalLight position={[10, 20, 10]} intensity={1.4} castShadow />
          <pointLight position={[-12, 6, -12]} intensity={1.2} color="#2B3BE5" />
          <spotLight position={[0, 14, 0]} angle={0.8} penumbra={1} intensity={2.4} color="#D4AF37" castShadow />

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
