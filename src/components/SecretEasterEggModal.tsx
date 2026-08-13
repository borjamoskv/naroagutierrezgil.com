import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SecretEasterEggModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SecretEasterEggModal({ isOpen, onClose }: SecretEasterEggModalProps) {
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
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🎨</div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#F59E0B', marginBottom: '16px' }}>
              ¡Has descubierto el palíndromo!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6', marginBottom: '24px' }}>
              «A NAROA LA ORAN ↔ AORAN» es un recordatorio de que el arte se contempla desde todos los ángulos y siempre proyecta lo imperecedero.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontFamily: 'Share Tech Mono, monospace', marginBottom: '32px' }}>
              Naroa Gutiérrez Gil · Bilbao
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
