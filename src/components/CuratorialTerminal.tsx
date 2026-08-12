import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sound } from '../utils/audio'

interface CuratorialTerminalProps {
  isOpen: boolean
  onClose: () => void
}

const TERMINAL_HISTORY = [
  'Iniciando Curatorial Terminal v4.0.0...',
  'Conectando con Matrix Curatorial de Naroa Gutiérrez Gil...',
  'Cargando metadatos de 140 obras...',
  'Acceso concedido. Escribe "help" para ver los comandos disponibles.'
]

export function CuratorialTerminal({ isOpen, onClose }: CuratorialTerminalProps) {
  const [history, setHistory] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setHistory(TERMINAL_HISTORY)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const handleCommand = (cmd: string) => {
    const normalizedCmd = cmd.trim().toLowerCase()
    const newHistory = [...history, `> ${cmd}`]

    switch (normalizedCmd) {
      case 'help':
        newHistory.push(
          'Comandos disponibles:',
          '  ls obras      - Listar todas las obras del catálogo',
          '  cat [id]      - Ver detalles de una obra específica',
          '  whois naroa   - Información curatorial de la artista',
          '  exit          - Cerrar terminal'
        )
        break
      case 'ls obras':
        newHistory.push(
          'marilyn-rocks.webp',
          'amy-rocks.webp',
          'james-rocks.webp',
          'freddie-mercury.webp',
          '... (136 más)'
        )
        break
      case 'whois naroa':
        newHistory.push(
          'Nombre: Naroa Gutiérrez Gil',
          'Base: Bilbao (Bolueta), Bizkaia',
          'Técnica: Hiperrealismo POP sobre Pizarra y Mica Mineral',
          'Estado: Aceptando encargos selectivos para 2026'
        )
        break
      case 'exit':
        onClose()
        break
      default:
        newHistory.push(`Comando no reconocido: ${normalizedCmd}. Escribe "help" para ayuda.`)
    }

    setHistory(newHistory)
    setCurrentInput('')
    sound.playTick()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '700px',
            height: '400px',
            background: 'rgba(10, 10, 14, 0.95)',
            backdropFilter: 'blur(24px)',
            border: '1px solid var(--cobalt)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(43, 59, 229, 0.2)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9rem',
            color: '#EAEAEA'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            padding: '12px 20px',
            background: 'rgba(43, 59, 229, 0.15)',
            borderBottom: '1px solid rgba(43, 59, 229, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: 'var(--cobalt-soft)', fontWeight: 700 }}>root@naroa-curatorial:~$</span>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              ✕
            </button>
          </div>

          {/* Terminal Body */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {history.map((line, i) => (
              <div key={i} style={{ 
                color: line.startsWith('>') ? 'var(--gold)' : line.includes('Error') ? '#FF453A' : 'rgba(255,255,255,0.8)',
                whiteSpace: 'pre-wrap'
              }}>
                {line}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un comando..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
