import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ARTWORKS } from '../artworks'
import { sound } from '../utils/audio'

interface GalleryGridProps {
  onInspect: (index: number) => void
}

export function GalleryGrid({ onInspect }: GalleryGridProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [columns, setColumns] = useState(3)

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

  // Masonry column distribution
  const cols: typeof ARTWORKS[] = Array.from({ length: columns }, () => [])
  const heights = new Array(columns).fill(0)

  ARTWORKS.forEach((art) => {
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
      padding: '0',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '4px',
        alignItems: 'start',
      }}>
        {cols.map((col, ci) => (
          <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {col.map((artwork) => {
              const idx = ARTWORKS.findIndex(a => a.id === artwork.id)
              const isHovered = hoveredId === artwork.id
              return (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: Math.min(idx * 0.035, 0.5) }}
                  onHoverStart={() => setHoveredId(artwork.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  onClick={() => { sound.playOpen(); onInspect(idx) }}
                  style={{
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    lineHeight: 0,
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
                      transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s ease',
                      transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                      filter: isHovered ? 'brightness(1.1) saturate(1.1)' : 'brightness(0.95)',
                    }}
                  />

                  {/* Kintsugi Gold Border Overlay on Hover */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    border: isHovered ? '1px solid #D4AF37' : '1px solid transparent',
                    boxShadow: isHovered ? 'inset 0 0 30px rgba(212, 175, 55, 0.25), 0 10px 30px rgba(0,0,0,0.8)' : 'none',
                    background: isHovered
                      ? 'linear-gradient(to top, rgba(7,7,10,0.85) 0%, rgba(7,7,10,0.1) 40%, transparent 100%)'
                      : 'transparent',
                    transition: 'all 0.4s ease',
                    pointerEvents: 'none',
                  }} />

                  {/* Artwork info badge on hover */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '20px 22px',
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: columns === 1 ? '1.6rem' : '1.25rem',
                        fontWeight: 700,
                        color: '#fff',
                        letterSpacing: '-0.02em',
                        textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                      }}>
                        {artwork.title}
                      </h3>
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        background: 'rgba(212, 175, 55, 0.2)',
                        border: '1px solid #D4AF37',
                        borderRadius: '12px',
                        color: '#D4AF37',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600
                      }}>
                        {artwork.year}
                      </span>
                    </div>

                    <span style={{
                      fontSize: '0.72rem',
                      color: 'rgba(255,255,255,0.75)',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {artwork.medium}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
