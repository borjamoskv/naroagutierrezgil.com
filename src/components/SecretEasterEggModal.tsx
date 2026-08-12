import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function SecretEasterEggModal({ isOpen, onClose }) {
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
            zIndex: 2000,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.8, rotate: 5 }}
            transition={{ type: 'spring', damping: 15 }}
            style={{
              background: '#111',
              border: '2px solid #F59E0B',
              borderRadius: '16px',
              padding: '40px',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 0 60px rgba(245, 158, 11, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🎨</div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#F59E0B', marginBottom: '16px' }}>
              ¡Has encontrado el secreto!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6', marginBottom: '24px' }}>
              "A O R A N" no es solo mi nombre al revés. Es un recordatorio de que el arte se puede mirar desde cualquier ángulo, y siempre revela algo nuevo.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontFamily: 'Share Tech Mono, monospace', marginBottom: '32px' }}>
              Gracias por explorar hasta el final.
            </p>
            <button onClick={onClose} className="premium-btn premium-btn--primary" style={{ width: '100%', justifyContent: 'center' }}>
              Cerrar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
