import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sound } from '../utils/audio'

interface EspejoDelAlmaModalProps {
  isOpen: boolean
  onClose: () => void
}

export function EspejoDelAlmaModal({ isOpen, onClose }: EspejoDelAlmaModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let time = 0

    const render = () => {
      time += 0.01
      const width = canvas.width
      const height = canvas.height
      
      ctx.fillStyle = '#050508'
      ctx.fillRect(0, 0, width, height)

      // Draw rippling "soul mirror" effect
      ctx.strokeStyle = 'rgba(43, 59, 229, 0.3)'
      ctx.lineWidth = 1
      
      const centerX = width / 2
      const centerY = height / 2
      
      for (let i = 0; i < 10; i++) {
        ctx.beginPath()
        const radius = 50 + i * 20 + Math.sin(time * 2 + i) * 10
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${43 + i * 10}, ${59 + i * 5}, ${229 - i * 10}, ${0.4 - i * 0.03})`
        ctx.stroke()
      }

      // Draw golden particles
      for (let i = 0; i < 20; i++) {
        const angle = time * 0.5 + i * 0.314
        const dist = 100 + Math.sin(time + i) * 50
        const x = centerX + Math.cos(angle) * dist
        const y = centerY + Math.sin(angle) * dist
        
        ctx.fillStyle = `rgba(245, 158, 11, ${0.3 + Math.sin(time * 3 + i) * 0.2})`
        ctx.beginPath()
        ctx.arc(x, y, 2 + Math.sin(time * 2 + i), 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      sound.playMicaShimmer()
    }
  }, [isOpen])

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
            zIndex: 10000,
            background: 'rgba(5, 5, 8, 0.9)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              background: '#0A0A10',
              border: '1px solid var(--cobalt)',
              borderRadius: '24px',
              padding: '40px',
              maxWidth: '600px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 0 60px rgba(43, 59, 229, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '2rem',
              fontWeight: 800,
              color: '#fff',
              marginBottom: '16px'
            }}>
              ESPEJO DEL <span style={{ color: 'var(--gold)' }}>ALMA</span>
            </h2>
            
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              style={{
                width: '100%',
                borderRadius: '12px',
                marginBottom: '24px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            />
            
            <p style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '1rem',
              lineHeight: 1.6,
              marginBottom: '24px'
            }}>
              "Cada piedra que uso tiene millones de años. Cada retrato que pinto tiene la edad de quien lo mira."
            </p>
            
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--cobalt-soft)',
              letterSpacing: '0.1em'
            }}>
              A O R A N · N A R O A · A O R A N
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
