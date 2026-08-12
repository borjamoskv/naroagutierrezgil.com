import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COMMANDS = {
  help: 'Comandos disponibles: obras, artista, tecnica, encargar, contacto, limpiar, salir',
  obras: 'Cargando colección... 27 obras encontradas. Destacan: "Marilyn Rocks", "Amy Rocks", "DiviNos".',
  artista: 'Naroa Gutiérrez Gil (Bilbao, 1978). Artista visual especializada en hiperrealismo POP sobre pizarra y mica.',
  tecnica: 'Acrílico y Posca sobre pizarra natural de tejado vasco. Incrustación de mica mineral para efecto de destello.',
  encargar: 'Para encargar un retrato, escribe a naroa@naroa.eu o usa la calculadora de encargos.',
  contacto: 'Email: naroa@naroa.eu | Instagram: @naroa_art | Estudio: Bolueta, Bilbao.',
  limpiar: 'CLEAR_TERMINAL',
  salir: 'Cerrando terminal...'
}

export function CuratorialTerminal({ isOpen, onClose }) {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([
    { type: 'system', text: 'NAROA TERMINAL v2.0.26 — Sistema Curatorial' },
    { type: 'system', text: 'Escribe "help" para ver los comandos disponibles.' }
  ])
  const inputRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      const cmd = input.trim().toLowerCase()
      const newHistory = [...history, { type: 'user', text: `> ${input}` }]
      
      if (cmd === 'limpiar') {
        setHistory([])
      } else if (cmd === 'salir') {
        onClose()
        return
      } else {
        const response = COMMANDS[cmd] || `Comando no reconocido: "${cmd}". Escribe "help".`
        newHistory.push({ type: 'system', text: response })
        setHistory(newHistory)
      }
      setInput('')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          style={{
            position: 'fixed',
            bottom: '40px',
            right: '40px',
            width: '400px',
            height: '300px',
            background: 'rgba(10, 10, 14, 0.95)',
            border: '1px solid rgba(43, 59, 229, 0.5)',
            borderRadius: '12px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 20px rgba(43, 59, 229, 0.2)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '0.85rem',
            pointerEvents: 'auto'
          }}
        >
          <div style={{
            padding: '8px 12px',
            background: 'rgba(43, 59, 229, 0.2)',
            borderBottom: '1px solid rgba(43, 59, 229, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#8D97FF'
          }}>
            <span>root@naroa:~$</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8D97FF', cursor: 'pointer' }}>✕</button>
          </div>
          
          <div style={{ flex: 1, padding: '12px', overflowY: 'auto', color: '#EAEAEA' }}>
            {history.map((line, i) => (
              <div key={i} style={{ marginBottom: '8px', color: line.type === 'user' ? '#F59E0B' : '#EAEAEA' }}>
                {line.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#F59E0B' }}>{'>'}</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleCommand}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#FFF',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: 'inherit'
              }}
              placeholder="Escribe un comando..."
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
