import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls, Environment, Preload } from '@react-three/drei'
import { EffectComposer, Noise, Vignette, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { Gallery } from './Gallery'

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface SceneProps {
  onCurrentChange: (index: number) => void
  onInspectArtwork: (index: number) => void
  targetIndex?: number | null
}

export default function Scene({ onCurrentChange, onInspectArtwork, targetIndex }: SceneProps) {
  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping }}>
      <color attach="background" args={['#07070a']} />

      <Suspense fallback={null}>
        <ScrollControls pages={4} infinite damping={0.1}>
          <Gallery
            onCurrentChange={onCurrentChange}
            onInspectArtwork={onInspectArtwork}
            targetIndex={targetIndex}
            reducedMotion={prefersReducedMotion}
          />
        </ScrollControls>

        <Environment preset="city" />

        {!prefersReducedMotion && (
          <EffectComposer>
            <Bloom luminanceThreshold={0.3} mipmapBlur intensity={0.85} />
            <Noise opacity={0.015} />
            <Vignette eskil={false} offset={0.15} darkness={0.95} />
            <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.0008, 0.0008)} />
          </EffectComposer>
        )}

        <Preload all />
      </Suspense>
    </Canvas>
  )
}
