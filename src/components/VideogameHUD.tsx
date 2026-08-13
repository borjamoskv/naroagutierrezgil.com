import { useEffect, useState } from 'react'
import { Minimap } from './Minimap'
import { sound } from '../utils/audio'

interface VideogameHUDProps {
  onStart: () => void
  isStarted: boolean
  interactionPrompt: string | null
  playerPos: { x: number; z: number }
  playerRotation: number
  cameraMode?: 'fps' | 'orbit'
  onToggleCameraMode?: () => void
}

export function VideogameHUD({
  onStart,
  isStarted,
  interactionPrompt,
  playerPos,
  playerRotation,
  cameraMode = 'fps',
  onToggleCameraMode
}: VideogameHUDProps) {
  const [glitch, setGlitch] = useState(false)

  // Efecto de Glitch aleatorio
  useEffect(() => {
    if (!isStarted) return
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setGlitch(true)
        setTimeout(() => setGlitch(false), 150)
      }
    }, 3500)
    return () => clearInterval(interval)
  }, [isStarted])

  if (!isStarted) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 100,
          backgroundColor: 'rgba(3, 3, 5, 0.92)',
          backgroundImage:
            'radial-gradient(circle at center, rgba(43,59,229,0.25) 0%, rgba(212,175,55,0.1) 50%, transparent 80%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          pointerEvents: 'auto',
          padding: '20px'
        }}
      >
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              letterSpacing: '0.25em',
              marginBottom: '0.5rem',
              textShadow: '0 0 30px #2B3BE5, 0 0 15px #D4AF37',
              fontFamily: 'Outfit, monospace',
              fontWeight: 900
            }}
          >
            NAROA <span style={{ color: '#D4AF37' }}>/</span> 3D
          </h1>
          <div
            style={{
              position: 'absolute',
              top: -12,
              right: -10,
              background: 'linear-gradient(135deg, #D4AF37, #2B3BE5)',
              color: 'black',
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              borderRadius: '12px',
              boxShadow: '0 0 10px #D4AF37'
            }}
          >
            GALERÍA PBR & SPREAD
          </div>
        </div>

        <p
          style={{
            fontSize: '1rem',
            marginBottom: '2.5rem',
            opacity: 0.8,
            letterSpacing: '0.15em',
            fontFamily: 'Share Tech Mono, monospace',
            textAlign: 'center',
            maxWidth: '600px',
            lineHeight: 1.6
          }}
        >
          [WASD] MOVER • [RATÓN] CÁMARA • [E] INSPECCIONAR OBRA <br />
          [F] VOLTEAR REVERSO ACÚSTICO • [C] MODO ÓRBITA / FPS
        </p>

        <button
          onClick={() => {
            sound.playSplatActivate()
            onStart()
          }}
          className="premium-btn premium-btn--primary"
          style={{
            fontSize: '1.25rem',
            padding: '1.2rem 3.5rem',
            border: '2px solid #D4AF37',
            background: 'rgba(212,175,55,0.15)',
            boxShadow: '0 0 30px rgba(212,175,55,0.4) inset, 0 0 20px rgba(43,59,229,0.3)',
            color: '#FFF',
            letterSpacing: '0.15em',
            cursor: 'pointer'
          }}
        >
          [ CLICK ] ENTRAR A LA GALERÍA 3D
        </button>
      </div>
    )
  }

  const isTargeting = interactionPrompt !== null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px',
        background:
          'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.05) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02))',
        backgroundSize: '100% 4px, 6px 100%'
      }}
    >
      {/* Top HUD Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div
          style={{
            background: 'rgba(5,5,10,0.85)',
            borderLeft: '4px solid #D4AF37',
            padding: '12px 20px',
            color: '#D4AF37',
            fontFamily: 'Share Tech Mono, monospace',
            backdropFilter: 'blur(10px)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            transform: glitch ? 'translateX(4px)' : 'translateX(0)',
            transition: 'transform 0.1s',
            boxShadow: '0 4px 20px rgba(0,0,0,0.6)'
          }}
        >
          <div style={{ fontSize: '0.72rem', opacity: 0.7 }}>Soporte Lítico</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>PIZARRA & MICA PBR</div>
        </div>

        {/* Dynamic Camera Switcher Button */}
        {onToggleCameraMode && (
          <button
            onClick={() => {
              sound.playTick()
              onToggleCameraMode()
            }}
            style={{
              pointerEvents: 'auto',
              background: 'rgba(5,5,10,0.85)',
              border: '1px solid rgba(212, 175, 55, 0.5)',
              borderRight: '4px solid #2B3BE5',
              padding: '10px 20px',
              color: '#FFF',
              fontFamily: 'Share Tech Mono, monospace',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              letterSpacing: '0.08em',
              borderRadius: '4px'
            }}
          >
            📷 VISTA: <strong style={{ color: '#D4AF37' }}>{cameraMode === 'fps' ? 'FPS INMERSIVO (WASD)' : 'ÓRBITA 3D (LIBRE)'}</strong> [TECLA C]
          </button>
        )}
      </div>

      {/* Retícula Crosshair (solo en modo FPS) */}
      {cameraMode === 'fps' && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: isTargeting ? '8px' : '4px',
              height: isTargeting ? '8px' : '4px',
              backgroundColor: isTargeting ? 'transparent' : 'rgba(255,255,255,0.85)',
              border: isTargeting ? '2px solid #D4AF37' : 'none',
              borderRadius: '50%',
              boxShadow: isTargeting ? '0 0 15px #D4AF37' : '0 0 10px rgba(255,255,255,0.5)',
              transition: 'all 0.2s ease'
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, ${isTargeting ? '-22px' : '-14px'})`,
              width: '2px',
              height: '8px',
              backgroundColor: isTargeting ? '#D4AF37' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.2s'
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, ${isTargeting ? '14px' : '6px'})`,
              width: '2px',
              height: '8px',
              backgroundColor: isTargeting ? '#D4AF37' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.2s'
            }}
          />
        </>
      )}

      {/* Interaction Prompt Bar */}
      {interactionPrompt && (
        <div
          style={{
            position: 'absolute',
            top: '56%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(5, 5, 12, 0.85)',
            padding: '10px 30px',
            color: '#D4AF37',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '1.05rem',
            fontWeight: 'bold',
            letterSpacing: '0.12em',
            textShadow: '0 0 10px #D4AF37',
            border: '1px solid rgba(212, 175, 55, 0.6)',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 25px rgba(212, 175, 55, 0.3)'
          }}
        >
          {interactionPrompt}
        </div>
      )}

      {/* Bottom Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
        <div
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '0.8rem',
            background: 'rgba(0,0,0,0.7)',
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}
        >
          <span>[ESC] Salir</span>
          <span>•</span>
          <span>[E] Modal Obra</span>
          <span>•</span>
          <span>[F] Reverso 3D</span>
        </div>

        {/* Radar Minimap */}
        <Minimap playerPos={playerPos} playerRotation={playerRotation} />
      </div>
    </div>
  )
}
