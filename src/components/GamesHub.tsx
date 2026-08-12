import React from 'react'
import { motion } from 'framer-motion'

const games = [
  { id: 'oca', name: 'Juego de la Oca', icon: '🎲', desc: 'Tablero clásico con obras de Naroa', status: 'playable' },
  { id: 'tetris', name: 'Tetris Artístico', icon: '🕹️', desc: 'Bloques con texturas de arte', status: 'playable' },
  { id: 'memory', name: 'Memory', icon: '🧠', desc: 'Encuentra las parejas de obras', status: 'playable' },
  { id: 'puzzle', name: 'Puzzle Deslizante', icon: '🧩', desc: 'Reconstruye la imagen', status: 'playable' },
  { id: 'snake', name: 'Snake', icon: '🐍', desc: 'Recoge piezas de arte', status: 'playable' },
  { id: 'breakout', name: 'Breakout', icon: '🧱', desc: 'Rompe bloques artísticos', status: 'playable' },
  { id: 'collage', name: 'Collage Alquímico', icon: '🎨', desc: 'Compón con materiales', status: 'featured' },
  { id: 'mica', name: 'MICA VIVA', icon: '✨', desc: 'Retratos que te miran', status: 'spectacular' },
  { id: 'kintsugi', name: 'Kintsugi Emocional', icon: '🥇', desc: 'Repara grietas con oro', status: 'spectacular' }
]

export function GamesHub({ onNavigate }) {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '120px 24px 80px',
      maxWidth: '1200px',
      margin: '0 auto',
      pointerEvents: 'auto'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="premium-badge premium-badge--gold">Sala de Juegos</span>
        <h1 className="premium-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '16px' }}>
          Arte <span className="highlight-gold">Jugable</span>
        </h1>
        <p className="premium-subtitle" style={{ maxWidth: '600px', marginBottom: '48px' }}>
          21 minijuegos creados con las obras de Naroa. El arte no solo se mira, se juega.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="premium-card"
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                border: game.status === 'spectacular' ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255,255,255,0.08)'
              }}
              onClick={() => onNavigate(`game-${game.id}`)}
            >
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{game.icon}</div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', color: '#FFF' }}>{game.name}</h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>{game.desc}</p>
              
              {game.status === 'spectacular' && (
                <span className="premium-badge premium-badge--gold" style={{ marginBottom: '16px' }}>
                  ✨ Experiencia Única
                </span>
              )}
              
              <button className="premium-btn" style={{ width: '100%', justifyContent: 'center' }}>
                Jugar Ahora
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
