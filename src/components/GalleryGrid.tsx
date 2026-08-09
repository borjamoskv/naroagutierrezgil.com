import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ARTWORKS } from '../artworks'
import { sound } from '../utils/audio'

interface GalleryGridProps {
  onInspect: (index: number) => void
}

const CATEGORIES = ['TODAS', 'PIZARRA', 'LIENZO', 'EN.LATA']

// 3D Tilt Card Component
function TiltCard({ artwork, isHovered, setHoveredId, onInspect, idx, columns }: any) {
  const ref = useRef<HTMLDivElement>(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Spring settings for ultra-smooth physics
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 }
  const mouseXSpring = useSpring(x, springConfig)
  const mouseYSpring = useSpring(y, springConfig)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [6, -6])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-6, 6])
  
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [100, -100])
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [100, -100])
  const glareOpacity = useTransform(mouseXSpring, [-0.5, 0.5], [0, 0.25])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    setHoveredId(null)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ 
        layout: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        y: { type: 'spring', stiffness: 250, damping: 25, delay: Math.min(idx * 0.04, 0.4) }
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHoveredId(artwork.id)}
      onMouseLeave={handleMouseLeave}
      onClick={() => { sound.playOpen(); onInspect(idx) }}
      style={{
        cursor: 'pointer',
        position: 'relative',
        perspective: '1200px',
        lineHeight: 0,
        borderRadius: '16px',
        padding: '2px', // subtle padding for the glow box
      }}
    >
      <motion.div
        style={{
          position: 'relative',
          borderRadius: '14px',
          overflow: 'hidden',
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: 'preserve-3d',
          boxShadow: isHovered 
            ? '0 30px 60px rgba(0,0,0,0.9), 0 0 40px rgba(245, 158, 11, 0.25)' 
            : '0 10px 30px rgba(0,0,0,0.5)',
          border: isHovered ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(255,255,255,0.05)',
          transition: 'border 0.4s ease, box-shadow 0.4s ease',
          background: '#050507'
        }}
      >
        <img
          src={artwork.url}
          alt={artwork.title}
          loading={idx < 6 ? 'eager' : 'lazy'}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            imageRendering: 'high-quality',
            transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s ease',
            transform: isHovered ? 'scale(1.06)' : 'scale(1.01)',
            filter: isHovered ? 'brightness(1.05) contrast(1.05) saturate(1.1)' : 'brightness(0.9) contrast(1.0) saturate(1.0)',
          }}
        />

        {/* Dynamic Glare Layer */}
        {isHovered && (
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 60%)',
              opacity: glareOpacity,
              x: glareX,
              y: glareY,
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
              transform: 'translateZ(1px)' // Keeps it on top in 3D space
            }}
          />
        )}

        {/* Glassmorphic Info Badge */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '28px 24px 24px 24px',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateY(0) translateZ(20px)' : 'translateY(12px) translateZ(0)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: 'linear-gradient(to top, rgba(5,5,7,0.98) 0%, rgba(5,5,7,0.7) 60%, transparent 100%)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{
              margin: 0,
              fontSize: columns === 1 ? '1.5rem' : '1.25rem',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 10px rgba(0,0,0,0.9)',
            }}>
              {artwork.title}
            </h3>
            <span style={{
              fontSize: '0.65rem',
              padding: '4px 10px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              borderRadius: '20px',
              color: '#FCD34D',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              letterSpacing: '0.05em',
              boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)'
            }}>
              {artwork.year}
            </span>
          </div>
          <span style={{
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.75)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {artwork.medium}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function GalleryGrid({ onInspect }: GalleryGridProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [columns, setColumns] = useState(3)
  const [filter, setFilter] = useState('TODAS')

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 580) setColumns(1)
      else if (w < 960) setColumns(2)
      else if (w < 1500) setColumns(3)
      else setColumns(4)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Filter artworks
  const filteredArtworks = ARTWORKS.filter(art => {
    if (filter === 'TODAS') return true
    if (filter === 'PIZARRA') return art.medium.toLowerCase().includes('pizarra')
    if (filter === 'LIENZO') return art.medium.toLowerCase().includes('lienzo')
    if (filter === 'EN.LATA') return art.medium.toLowerCase().includes('en.lata') || art.title.toLowerCase().includes('en.lata')
    return true
  })

  // Masonry column distribution
  const cols: typeof ARTWORKS[] = Array.from({ length: columns }, () => [])
  const heights = new Array(columns).fill(0)

  filteredArtworks.forEach((art) => {
    const shortest = heights.indexOf(Math.min(...heights))
    cols[shortest].push(art)
    const h = art.sizeCategory === 'colossal' ? 4 : art.sizeCategory === 'large' ? 3 : art.sizeCategory === 'medium' ? 2.2 : 1.6
    heights[shortest] += h
  })

  return (
    <div style={{
      width: '100%',
      maxWidth: '2400px',
      margin: '0 auto',
      padding: '40px 20px 80px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Premium Filter Bar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '40px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => {
              sound.playTick()
              setFilter(cat)
            }}
            style={{
              padding: '10px 24px',
              borderRadius: '30px',
              background: filter === cat ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.03)',
              border: filter === cat ? '1px solid rgba(245, 158, 11, 0.6)' : '1px solid rgba(255,255,255,0.1)',
              color: filter === cat ? '#FCD34D' : 'rgba(255,255,255,0.6)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none',
              boxShadow: filter === cat ? '0 0 20px rgba(245, 158, 11, 0.2)' : 'none'
            }}
            onMouseOver={(e) => {
              if (filter !== cat) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = '#fff'
              }
            }}
            onMouseOut={(e) => {
              if (filter !== cat) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
              }
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '16px',
        alignItems: 'start',
        width: '100%'
      }}>
        <AnimatePresence mode="popLayout">
          {cols.map((col, ci) => (
            <motion.div 
              key={`col-${ci}`}
              layout
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <AnimatePresence mode="popLayout">
                {col.map((artwork) => {
                  const globalIdx = ARTWORKS.findIndex(a => a.id === artwork.id)
                  return (
                    <TiltCard
                      key={artwork.id}
                      artwork={artwork}
                      isHovered={hoveredId === artwork.id}
                      setHoveredId={setHoveredId}
                      onInspect={onInspect}
                      idx={globalIdx}
                      columns={columns}
                    />
                  )
                })}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
