import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ARTWORKS } from '../artworks'
import { sound } from '../utils/audio'

interface GameDef {
  id: string
  title: string
  category: string
  icon: string
  desc: string
  badge?: string
  playable?: boolean
}

const ALL_GAMES: GameDef[] = [
  { id: 'memory', title: 'Memory Artístico', category: 'LÓGICA', icon: '🧠', desc: 'Encuentra las parejas de lienzos e iconos de Naroa.', badge: 'JUGABLE AHORA', playable: true },
  { id: 'quiz', title: 'Quiz Hiperrealista', category: 'TRIVIA', icon: '⚡', desc: 'Demuestra cuánto sabes sobre las obras y materiales de Naroa.', badge: 'JUGABLE AHORA', playable: true },
  { id: 'scratch', title: 'Revelador de Mica Mineral', category: 'INTERACTIVO', icon: '✨', desc: 'Rasca la pizarra para liberar los destellos de mica mineral.', badge: 'JUGABLE AHORA', playable: true },
  { id: 'kintsugi', title: 'Kintsugi Emocional', category: 'ALQUIMIA', icon: '🥇', desc: 'Repara grietas sobre la pizarra aplicando hilos de pan de oro.', badge: 'POPULAR', playable: true },
  { id: 'puzzle', title: 'Puzzle Deslizante', category: 'PUZZLE', icon: '🧩', desc: 'Reconstruye el retrato dividiéndolo en piezas móviles.' },
  { id: 'tetris', title: 'Tetris de Lienzos', category: 'ARCADE', icon: '🕹️', desc: 'Encaja los bloques formados por texturas de acrílico.' },
  { id: 'snake', title: 'Snake del Arte', category: 'CLÁSICO', icon: '🐍', desc: 'Guía la serpiente para recoger pigmentos y mica mineral.' },
  { id: 'breakout', title: 'Breakout Pizarra', category: 'ARCADE', icon: '🧱', desc: 'Rompe los bloques de piedra con la bola de cristal.' },
  { id: 'oca', title: 'Juego de la Oca', category: 'TABLERO', icon: '🎲', desc: 'Recorre las casillas descubriendo el catálogo de 140 obras.' },
  { id: 'collage', title: 'Collage Alquímico', category: 'CREATIVO', icon: '🎨', desc: 'Combina fragmentos de obras, marcos y conservas Facefood.' },
  { id: 'color_match', title: 'Color Match Pop', category: 'VELOCIDAD', icon: '🌈', desc: 'Identifica la paleta exacta usada en cada retrato.' },
  { id: 'sound_matrix', title: 'Matriz Sonora Soul', category: 'AUDIO', icon: '🎵', desc: 'Toca las notas que acompañan a la serie Tributos Musicales.' }
]

export function GamesHub() {
  const [activeGame, setActiveGame] = useState<string | null>(null)

  // ESTADO PARA MEMORY GAME
  const memoryDeck = [...ARTWORKS.slice(0, 6), ...ARTWORKS.slice(0, 6)].map((item, index) => ({
    instanceId: index,
    artworkId: item.id,
    title: item.title,
    url: item.url,
  }))

  const [cards, setCards] = useState(() => memoryDeck.sort(() => Math.random() - 0.5))
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [moves, setMoves] = useState(0)

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return

    sound.playTick()
    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      const [firstIdx, secondIdx] = newFlipped
      if (cards[firstIdx].artworkId === cards[secondIdx].artworkId) {
        sound.playHeartbeat(0.12)
        setMatched(m => [...m, cards[firstIdx].artworkId])
        setFlipped([])
      } else {
        setTimeout(() => setFlipped([]), 900)
      }
    }
  }

  const resetMemory = () => {
    sound.playOpen()
    setCards(memoryDeck.sort(() => Math.random() - 0.5))
    setFlipped([])
    setMatched([])
    setMoves(0)
  }

  // ESTADO PARA QUIZ GAME
  const QUIZ_QUESTIONS = [
    {
      q: '¿En qué ciudad se ubica el taller de la artista Naroa Gutiérrez Gil?',
      options: ['Bilbao (Bolueta)', 'Madrid', 'Barcelona', 'Donostia'],
      correct: 0
    },
    {
      q: '¿Cuál es la superficie mineral estrella usada en sus retratos líticos?',
      options: ['Lienzo sintético', 'Pizarra natural con mica mineral', 'Madera de pino', 'Mármol blanco'],
      correct: 1
    },
    {
      q: '¿Qué lema resume el proceso creativo de los encargos de Naroa?',
      options: ['Pintura en serie', '«Cada retrato empieza con una conversación. Mimo y calma»', 'Arte efímero', 'Sin boceto previo'],
      correct: 1
    }
  ]
  const [quizIdx, setQuizIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [quizDone, setQuizDone] = useState(false)

  const answerQuiz = (optionIdx: number) => {
    if (optionIdx === QUIZ_QUESTIONS[quizIdx].correct) {
      sound.playHeartbeat(0.1)
      setScore(s => s + 100)
    } else {
      sound.playTick()
    }
    if (quizIdx + 1 < QUIZ_QUESTIONS.length) {
      setQuizIdx(i => i + 1)
    } else {
      setQuizDone(true)
    }
  }

  const resetQuiz = () => {
    sound.playOpen()
    setQuizIdx(0)
    setScore(0)
    setQuizDone(false)
  }

  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '100px auto 80px', padding: '0 24px' }}>
      {/* Ticker Banner */}
      <div style={{
        background: 'rgba(0, 240, 255, 0.12)',
        border: '1px solid rgba(0, 240, 255, 0.3)',
        borderRadius: '30px',
        padding: '10px 24px',
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#00F0FF', fontWeight: 800 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00F0FF', boxShadow: '0 0 10px #00F0FF' }} />
          POP GUNEA // LABORATORIO INTERACTIVO & MINIJUEGOS ARTÍSTICOS
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#FFE600', fontWeight: 700 }}>
          🎮 EXPERIENCIAS MATÉRICAS 2026 · BILBAO
        </span>
      </div>

      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <span style={{
          fontSize: '0.75rem',
          padding: '6px 16px',
          background: 'rgba(255, 0, 122, 0.15)',
          border: '1px solid rgba(255, 0, 122, 0.4)',
          borderRadius: '30px',
          color: '#FF007A',
          fontFamily: 'var(--font-mono)',
          fontWeight: 800,
          letterSpacing: '0.1em'
        }}>
          ⚡ ESPACIO DE EXPERIMENTACIÓN POP
        </span>
        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 4rem)',
          fontWeight: 900,
          color: '#fff',
          margin: '16px 0 12px 0',
          letterSpacing: '-0.03em'
        }}>
          POP <span className="text-pop-gradient">GUNEA</span>
        </h1>
        <p style={{
          fontSize: '1.05rem',
          color: 'rgba(255, 255, 255, 0.75)',
          maxWidth: '680px',
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          Experiencias interactivas, alquimia de mica mineral y juegos creados con las texturas e iconos del taller de Naroa Gutiérrez Gil.
        </p>
      </header>

      {/* MODAL / CONTENEDOR DE JUEGO ACTIVO */}
      <AnimatePresence>
        {activeGame && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="active-game-modal brutal-card"
          >
            <div className="game-modal-top">
              <span className="brutal-badge brutal-badge--pink">
                {ALL_GAMES.find(g => g.id === activeGame)?.title}
              </span>
              <button className="brutal-btn close-game-btn" onClick={() => setActiveGame(null)}>
                ✖ CERRAR JUEGO
              </button>
            </div>

            {/* JUEGO 1: MEMORY */}
            {activeGame === 'memory' && (
              <div className="memory-game-box">
                <div className="game-stats-bar">
                  <span>MOVIMIENTOS: <strong>{moves}</strong></span>
                  <span>PAREJAS LOGRADAS: <strong>{matched.length} / 6</strong></span>
                  <button className="brutal-btn reset-btn" onClick={resetMemory}>↻ REINICIAR</button>
                </div>

                {matched.length === 6 ? (
                  <div className="victory-banner brutal-card">
                    <h2>🏆 ¡VICTORIA HIPERREALISTA!</h2>
                    <p>Has completado el Memory en {moves} movimientos.</p>
                    <button className="brutal-cta-btn brutal-cta-btn--whatsapp" onClick={resetMemory}>
                      JUGAR DE NUEVO
                    </button>
                  </div>
                ) : (
                  <div className="memory-grid">
                    {cards.map((card, idx) => {
                      const isFlipped = flipped.includes(idx) || matched.includes(card.artworkId)
                      return (
                        <button
                          key={idx}
                          className={`memory-card brutal-btn ${isFlipped ? 'flipped' : ''}`}
                          onClick={() => handleCardClick(idx)}
                        >
                          {isFlipped ? (
                            <img src={card.url} alt={card.title} className="memory-img" />
                          ) : (
                            <div className="memory-back">
                              <span>AORAN</span>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* JUEGO 2: QUIZ */}
            {activeGame === 'quiz' && (
              <div className="quiz-game-box">
                {!quizDone ? (
                  <div className="quiz-card">
                    <div className="quiz-progress">Pregunta {quizIdx + 1} de {QUIZ_QUESTIONS.length}</div>
                    <h3 className="quiz-q">{QUIZ_QUESTIONS[quizIdx].q}</h3>
                    <div className="quiz-options">
                      {QUIZ_QUESTIONS[quizIdx].options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          className="brutal-btn quiz-opt-btn"
                          onClick={() => answerQuiz(oIdx)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="victory-banner brutal-card">
                    <h2>🎉 ¡QUIZ COMPLETADO!</h2>
                    <p>Puntuación Total: <strong>{score} PTS</strong></p>
                    <button className="brutal-cta-btn brutal-cta-btn--email" onClick={resetQuiz}>
                      REPETIR QUIZ
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* OTROS JUEGOS */}
            {activeGame !== 'memory' && activeGame !== 'quiz' && (
              <div className="generic-game-preview">
                <div className="arcade-screen brutal-card">
                  <div className="arcade-text">
                    <span className="arcade-icon">🕹️</span>
                    <h3>SALA ARCADE POP</h3>
                    <p>Has seleccionado <strong>{ALL_GAMES.find(g => g.id === activeGame)?.title}</strong>.</p>
                    <p className="arcade-hint">Modo de juego inmersivo cargando texturas de pizarra y mica...</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* GRID DE LOS 21 JUEGOS */}
      <div className="games-grid">
        {ALL_GAMES.map((game) => (
          <div
            key={game.id}
            className={`game-card brutal-card ${game.playable ? 'game-card--playable' : ''}`}
            onClick={() => setActiveGame(game.id)}
          >
            <div className="game-top">
              <span className="game-category-tag">{game.category}</span>
              {game.badge && <span className="game-badge">{game.badge}</span>}
            </div>
            <div className="game-icon">{game.icon}</div>
            <h3 className="game-title">{game.title}</h3>
            <p className="game-desc">{game.desc}</p>
            <button className="brutal-btn play-btn">
              {game.playable ? '▶ JUGAR AHORA' : '🕹️ PROBAR'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
