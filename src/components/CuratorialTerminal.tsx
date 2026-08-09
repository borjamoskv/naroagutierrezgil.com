import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sound } from '../utils/audio'

interface CuratorialTerminalProps {
  isOpen: boolean
  onClose: () => void
}

const COMMAND_HELP = `
========================================================================
NAROA GUTIÉRREZ GIL — CURATORIAL TERMINAL CLI [C5-REAL v2026.8]
========================================================================
Comandos disponibles:
  help               Muestra esta lista de comandos.
  manifesto          Despliega el Manifiesto Curatorial ("Espejos Emocionales").
  series             Enumera las 4 Series (DiviNos, Vaivenes, Espejos del Alma, Facefood).
  hemeroteca         Abre los registros de prensa (El País, La Vanguardia, El Correo).
  materials <obra>   Muestra la trazabilidad matérica (Pizarra, Mica, Resina, Cola).
  provenance         Exporta el certificado de autenticidad curatorial.
  asmr               Activa el audio espacial binaural del estudio.
  clear              Limpia la pantalla de la consola.
  exit               Cierra el terminal.
========================================================================
`

export const CuratorialTerminal: React.FC<CuratorialTerminalProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([
    'NAROA.ONLINE CURATORIAL CLI v2026.08',
    'Escribe "help" para ver los comandos disponibles o "manifesto" para el texto curatorial.',
    '------------------------------------------------------------------------'
  ])
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const handleCommand = (cmdStr: string) => {
    const raw = cmdStr.trim()
    const lower = raw.toLowerCase()
    sound.playSlateRasp()

    const newHistory = [...history, `> ${raw}`]

    if (lower === 'help') {
      newHistory.push(COMMAND_HELP)
    } else if (lower === 'manifesto') {
      newHistory.push(`
MANIFIESTO CURATORIAL — NAROA GUTIÉRREZ GIL
"Todos somos lo mismo con distintas apariencias."

1. EL HIPERREALISMO POP COMO SÍNTESIS
   No es la simple reproducción fotográfica; es la revelación de la vulnerabilidad detras del mito.

2. LA PIZARRA NATURAL DE TEJADO VASCO
   El soporte primordial que representa el tejado y el hogar que nos guarece (derribos arquitectónicos en Bizkaia).

3. LA MICA MINERAL & EL PAN DE ORO 24K
   Láminas minerales que capturan destellos iridiscentes según la inclinación de la luz en la sala expositiva.
`)
    } else if (lower === 'series') {
      newHistory.push(`
1. «DIVINOS» (2010-2026): Retratos de iconos como espejos emocionales (Amy Winehouse, Marilyn, James Dean, Johnny).
2. «VAIVENES» (2020-2026): Turbulencias internas y facciones de facetas profundas.
3. «ESPEJOS DEL ALMA» (2010-2026): Esencia común del ser humano en collage multi-soporte (lienzo, madera, metal).
4. «FACEFOOD» (2014-2026): Los rostros como alimento visual y textura inédita sobre cola blanca.
`)
    } else if (lower === 'hemeroteca') {
      newHistory.push(`
[REGISTRO HEMEROGRÁFICO DE PRENSA VERIFICADO]
• EL PAÍS: "Retratos sobre pizarra que capturan la memoria matérica en Bilbao."
• LA VANGUARDIA: "Naroa Gutiérrez Gil y la revolución del hiperrealismo pop."
• EL CORREO: "Exposición Facefood en Plentzia — La textura de la iconografía contemporánea."
`)
    } else if (lower.startsWith('materials')) {
      newHistory.push(`
[TRAZABILIDAD MATÉRICA — FUSION C5-REAL]
• Soporte: Pizarra natural de tejado vasco (derribos arquitectónicos de Bizkaia).
• Pigmentos: Acrílicos Uni-Posca, óleo holandés, pastel Conté & rotulador Sharpie.
• Aglutinantes & Texturas: Cola blanca vinílica, resina epoxi de alto brillo y escamas de mica mineral pura.
`)
    } else if (lower === 'provenance') {
      newHistory.push(`
[CERTIFICADO DE AUTENTICIDAD & PROVENANCE GENERADO]
HASH SCITT: 0x9b368072241b471dbe9871
ARTISTA: Naroa Gutiérrez Gil (Bilbao, España)
VERIFICACIÓN: Certificado con sello de mica mineral y firma hológrafa.
`)
    } else if (lower === 'asmr') {
      sound.startStudioASMR()
      newHistory.push('[AUDIO ASMR] Audio binaural espacial del estudio activado. Manten la barra espaciadora para escuchar el rasgado sobre pizarra.')
    } else if (lower === 'clear') {
      setHistory([])
      setInput('')
      return
    } else if (lower === 'exit' || lower === 'quit') {
      onClose()
      return
    } else {
      newHistory.push(`Comando no reconocido: "${raw}". Escribe "help" para ver la lista de comandos.`)
    }

    setHistory(newHistory)
    setInput('')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 5, 10, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          zIndex: 10000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}
      >
        <motion.div
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '850px',
            height: '540px',
            backgroundColor: '#07070D',
            border: '1px solid #FF007A',
            borderRadius: '16px',
            boxShadow: '0 0 40px rgba(255, 0, 122, 0.35), 0 0 20px rgba(0, 240, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'var(--font-mono)',
            color: '#00F0FF'
          }}
        >
          {/* Header Terminal Bar */}
          <div style={{
            padding: '12px 20px',
            backgroundColor: '#0D0D18',
            borderBottom: '1px solid rgba(255, 0, 122, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FF007A', display: 'inline-block' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FFE600', display: 'inline-block' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#00F0FF', display: 'inline-block' }} />
              <span style={{ fontSize: '0.8rem', color: '#fff', marginLeft: '12px', fontWeight: 700 }}>
                TERMINAL CURATORIAL // NAROA.ONLINE [Cmd + K]
              </span>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '1rem'
              }}
            >
              [ESC ✕]
            </button>
          </div>

          {/* Terminal Body Log */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap'
          }}>
            {history.map((line, idx) => (
              <div key={idx} style={{
                color: line.startsWith('>') ? '#FFE600' : line.includes('MANIFIESTO') ? '#FF007A' : '#00F0FF'
              }}>
                {line}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Terminal Input Line */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (input) handleCommand(input)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 20px',
              backgroundColor: '#0B0B14',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <span style={{ color: '#FF007A', marginRight: '10px', fontWeight: 'bold' }}>&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe un comando ('help', 'manifesto', 'series', 'hemeroteca')..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.88rem'
              }}
            />
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
