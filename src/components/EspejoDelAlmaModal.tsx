import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function EspejoDelAlmaModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})

  const questions = [
    {
      id: 'mood',
      text: '¿Qué emoción buscas capturar?',
      options: ['Alegría Vibrante', 'Melancolía Profunda', 'Misterio', 'Fuerza Interior']
    },
    {
      id: 'color',
      text: '¿Qué paleta resuena contigo?',
      options: ['Cálidos (Oros, Rojos)', 'Fríos (Azules, Platas)', 'Contrastes (B/N + Color)', 'Neutros Minerales']
    },
    {
      id: 'support',
      text: '¿Qué soporte te atrae más?',
      options: ['Pizarra Vasca (Historia)', 'Lienzo (Clásico)', 'Mica (Brillo)', 'Sorpresa']
    }
  ]

  const handleAnswer = (option) => {
    const newAnswers = { ...answers, [questions[step].id]: option }
    setAnswers(newAnswers)
    
    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      // Finalizar
      setStep(questions.length)
    }
  }

  const getRecommendation = () => {
    // Lógica simple de recomendación basada en respuestas
    const { mood, color, support } = answers
    
    if (support === 'Mica (Brillo)') return 'Serie "DiviNos" - La luz hecha retrato.'
    if (support === 'Pizarra Vasca (Historia)') return 'Serie "Rocks" - Iconos con alma de piedra.'
    if (color === 'Cálidos (Oros, Rojos)') return 'Serie "Tributos Musicales" - Pasión en cada nota.'
    return 'Retrato Personalizado - Tu historia, mi pincel.'
  }

  const reset = () => {
    setStep(0)
    setAnswers({})
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(5, 5, 8, 0.9)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -20 }}
            style={{
              background: 'linear-gradient(145deg, rgba(20, 20, 30, 0.9), rgba(10, 10, 15, 0.95))',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '24px',
              padding: '40px',
              maxWidth: '500px',
              width: '100%',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 0 60px rgba(245, 158, 11, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', marginBottom: '8px', color: '#F59E0B' }}>
              Espejo del Alma
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px', fontFamily: 'Share Tech Mono, monospace', fontSize: '0.9rem' }}>
              Descubre qué obra resuena contigo
            </p>

            {step < questions.length ? (
              <div>
                <div style={{ marginBottom: '24px', fontSize: '1.2rem', color: '#FFF' }}>
                  {questions[step].text}
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {questions[step].options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className="premium-btn"
                      style={{ justifyContent: 'center', width: '100%' }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {questions.map((_, i) => (
                    <div 
                      key={i} 
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: i === step ? '#F59E0B' : 'rgba(255,255,255,0.2)'
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✨</div>
                <h3 style={{ fontSize: '1.5rem', color: '#FFF', marginBottom: '16px' }}>
                  Tu Alma Resuena Con...
                </h3>
                <p style={{ fontSize: '1.2rem', color: '#F59E0B', marginBottom: '32px', fontFamily: 'Outfit, sans-serif' }}>
                  {getRecommendation()}
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={reset} className="premium-btn">
                    Repetir
                  </button>
                  <button onClick={onClose} className="premium-btn premium-btn--primary">
                    Explorar Obra
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
