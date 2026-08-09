import { ARTWORKS } from '../artworks'

interface MinimapProps {
  playerPos: { x: number; z: number }
  playerRotation: number
}

export function Minimap({ playerPos, playerRotation }: MinimapProps) {
  const radius = 10 // Radio del círculo de obras en la escena
  const mapSize = 130 // Tamaño en px del widget
  const mapRadius = mapSize / 2
  const worldScale = mapRadius / 14 // Escala de metros 3D a píxeles HUD

  const numItems = ARTWORKS.length

  return (
    <div
      style={{
        width: `${mapSize}px`,
        height: `${mapSize}px`,
        borderRadius: '50%',
        backgroundColor: 'rgba(5, 5, 10, 0.75)',
        border: '2px solid rgba(212, 175, 55, 0.6)',
        boxShadow: '0 0 15px rgba(212, 175, 55, 0.25) inset, 0 0 10px rgba(0, 0, 0, 0.8)',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(6px)',
        pointerEvents: 'none'
      }}
    >
      {/* Retícula de Radar (Líneas de cuadrícula) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle, rgba(43, 59, 229, 0.3) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px, 20px 20px, 20px 20px',
          backgroundPosition: 'center center'
        }}
      />

      {/* Círculo guía de ubicación de obras */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: `${radius * 2 * worldScale}px`,
          height: `${radius * 2 * worldScale}px`,
          border: '1px dashed rgba(43, 59, 229, 0.4)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />

      {/* Puntos de Obras de Arte (Blips de Radar) */}
      {ARTWORKS.map((_, i) => {
        const angle = (i / numItems) * Math.PI * 2
        const wx = Math.sin(angle) * radius
        const wz = Math.cos(angle) * radius

        // Posición relativa al jugador
        const relX = (wx - playerPos.x) * worldScale
        const relZ = (wz - playerPos.z) * worldScale

        const screenX = mapRadius + relX
        const screenY = mapRadius + relZ

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${screenX}px`,
              top: `${screenY}px`,
              width: '6px',
              height: '6px',
              backgroundColor: '#D4AF37',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 6px #D4AF37'
            }}
          />
        )
      })}

      {/* Jugador (Punto Central con Flecha de Orientación) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '10px',
          height: '10px',
          backgroundColor: '#2B3BE5',
          border: '1.5px solid white',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 10px #2B3BE5',
          zIndex: 10
        }}
      />

      {/* Indicador de Mirada / Orientación del Jugador */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '0',
          height: '0',
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderBottom: '12px solid #D4AF37',
          transformOrigin: '50% 100%',
          transform: `translate(-50%, -100%) rotate(${playerRotation}rad)`,
          zIndex: 9,
          opacity: 0.85
        }}
      />
    </div>
  )
}
