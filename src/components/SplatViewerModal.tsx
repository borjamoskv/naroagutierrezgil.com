import { Suspense, useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Splat, OrbitControls, Float, Sparkles, Center, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { sound } from '../utils/audio'

interface SplatViewerProps {
  splatUrl: string
  title: string
  onClose: () => void
}

type LightingPreset = 'gold' | 'neon' | 'studio'

import { easing } from 'maath'

function AnimatedSplatGroup({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((_, delta) => {
    if (groupRef.current) {
      easing.damp3(groupRef.current.scale, [1, 1, 1], 1.5, delta)
      easing.dampE(groupRef.current.rotation, [0, 0, 0], 2.0, delta)
    }
  })

  return (
    <group ref={groupRef} scale={0.01} rotation={[0, -Math.PI / 2, 0]}>
      {children}
    </group>
  )
}

function SplatScene({ splatUrl, lightPreset }: { splatUrl: string; lightPreset: LightingPreset }) {
  const primaryLightColor = lightPreset === 'gold' ? '#D4AF37' : lightPreset === 'neon' ? '#2B3BE5' : '#ffffff'
  const secondaryLightColor = lightPreset === 'gold' ? '#2B3BE5' : lightPreset === 'neon' ? '#ff0055' : '#e0e0e0'

  return (
    <Center top position={[0, 0, 0]}>
      <AnimatedSplatGroup>
        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
          <Splat
            src={splatUrl}
            scale={1.6}
            rotation={[0, 0, 0]}
          />
        </Float>
      </AnimatedSplatGroup>

      {/* Iluminación Dinámica PBR Reactiva al Preset */}
      <ambientLight intensity={lightPreset === 'studio' ? 2.0 : 1.2} />
      <directionalLight position={[5, 8, 5]} intensity={3.0} color={primaryLightColor} />
      <pointLight position={[-5, -4, -5]} intensity={1.8} color={secondaryLightColor} />
      <pointLight position={[5, 5, -5]} intensity={1.5} color={primaryLightColor} />
      <spotLight position={[0, 10, 8]} angle={0.4} penumbra={1} intensity={3.5} color={primaryLightColor} />
    </Center>
  )
}

export function SplatViewerModal({ splatUrl, title, onClose }: SplatViewerProps) {
  const [lightPreset, setLightPreset] = useState<LightingPreset>('gold')
  const [autoRotate, setAutoRotate] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [dpr, setDpr] = useState(1.5)
  const [enableEffects, setEnableEffects] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<OrbitControlsImpl>(null)

  useEffect(() => {
    sound.playSplatActivate()
  }, [])

  const changeLightPreset = (preset: LightingPreset) => {
    sound.playSplatLightChange()
    setLightPreset(preset)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }

  return (
    <div
      ref={containerRef}
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'radial-gradient(circle at 50% 50%, #0d0e15 0%, #030305 100%)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          zIndex: 10000,
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          color: '#ffffff',
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          fontSize: '22px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          backdropFilter: 'blur(8px)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#2B3BE5'
          e.currentTarget.style.borderColor = '#D4AF37'
          e.currentTarget.style.transform = 'scale(1.08)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        ✕
      </button>

      {/* Header Info */}
      <div
        style={{
          position: 'absolute',
          top: '28px',
          left: '28px',
          zIndex: 10000,
          pointerEvents: 'none',
          maxWidth: '80vw',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span
            style={{
              padding: '4px 12px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(43, 59, 229, 0.25) 100%)',
              border: '1px solid #D4AF37',
              color: '#D4AF37',
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              letterSpacing: '1.5px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              boxShadow: '0 0 12px rgba(212, 175, 55, 0.3)',
            }}
          >
            ⚡ 3D Gaussian Splatting (WebGPU / PBR)
          </span>
        </div>
        <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>
          {title}
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.65)', fontWeight: 400 }}>
          Arrastra para orbitar en 360° • Usa rueda para zoom • Selecciona un ambiente de luz
        </p>
      </div>

      {/* Barra de Herramientas e Iluminación (Bottom Floating Dock) */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 16px',
          background: 'rgba(15, 15, 22, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '40px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', paddingLeft: '4px' }}>
          LUZ:
        </span>

        <button
          onClick={() => changeLightPreset('gold')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: lightPreset === 'gold' ? '1px solid #D4AF37' : '1px solid transparent',
            background: lightPreset === 'gold' ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.05)',
            color: lightPreset === 'gold' ? '#D4AF37' : '#aaaaaa',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          🟡 Barroco Oro
        </button>

        <button
          onClick={() => changeLightPreset('neon')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: lightPreset === 'neon' ? '1px solid #2B3BE5' : '1px solid transparent',
            background: lightPreset === 'neon' ? 'rgba(43, 59, 229, 0.3)' : 'rgba(255,255,255,0.05)',
            color: lightPreset === 'neon' ? '#8090ff' : '#aaaaaa',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          🔵 Neón Cobalto
        </button>

        <button
          onClick={() => changeLightPreset('studio')}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            border: lightPreset === 'studio' ? '1px solid #ffffff' : '1px solid transparent',
            background: lightPreset === 'studio' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255,255,255,0.05)',
            color: lightPreset === 'studio' ? '#ffffff' : '#aaaaaa',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          ⚪ Estudio Neutro
        </button>

        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: autoRotate ? 'rgba(255,255,255,0.15)' : 'transparent',
            color: autoRotate ? '#ffffff' : '#888888',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title="Activar/Desactivar giro automático"
        >
          {autoRotate ? '⏸ PAUSAR GIRO' : '▶ ROTAR'}
        </button>

        <button
          onClick={handleResetCamera}
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent',
            color: '#ffffff',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title="Reiniciar vista de cámara"
        >
          🎯 RECENTRAR
        </button>

        <button
          onClick={toggleFullscreen}
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: isFullscreen ? '#2B3BE5' : 'transparent',
            color: '#ffffff',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title="Modo pantalla completa"
        >
          {isFullscreen ? '↙ SALIR PANTALLA' : '⛶ FULLSCREEN'}
        </button>
      </div>

      {/* Canvas 3D R3F para Gaussian Splatting */}
      <div style={{ width: '100%', height: '100%', cursor: 'grab' }}>
        <Canvas
          dpr={dpr}
          camera={{ position: [0, 1.2, 3.5], fov: 45 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, powerPreference: 'high-performance' }}
        >
          <PerformanceMonitor
            onDecline={() => {
              setDpr(1)
              setEnableEffects(false)
            }}
            onIncline={() => setDpr(1.5)}
          />
          <color attach="background" args={['#040407']} />

          <Sparkles count={100} scale={[12, 12, 12]} size={2.5} speed={0.4} color={lightPreset === 'gold' ? '#D4AF37' : '#2B3BE5'} />
          <Sparkles count={60} scale={[10, 10, 10]} size={2} speed={0.3} color="#ffffff" />

          <Suspense fallback={null}>
            <SplatScene splatUrl={splatUrl} lightPreset={lightPreset} />
          </Suspense>

          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={autoRotate}
            autoRotateSpeed={1.0}
            minDistance={0.8}
            maxDistance={9}
          />

          {enableEffects && (
            <EffectComposer multisampling={4}>
              <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} opacity={0.6} intensity={0.5} />
              <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={new THREE.Vector2(0.002, 0.002)}
                radialModulation={false}
                modulationOffset={0}
              />
              <Noise opacity={0.065} blendFunction={BlendFunction.OVERLAY} />
              <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
          )}
        </Canvas>
      </div>
    </div>
  )
}
