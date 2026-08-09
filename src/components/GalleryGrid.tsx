import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ARTWORKS } from '../artworks'
import { sound } from '../utils/audio'

interface GalleryGridProps {
  onInspect: (index: number) => void
}

const CATEGORIES = [
  { key: 'TODAS', label: '⚡ TODAS' },
  { key: 'DIVINOS', label: '👑 DIVINOS' },
  { key: 'VAIVENES', label: '🌀 VAIVENES' },
  { key: 'ESPEJOS', label: '🪞 ESPEJOS DEL ALMA' },
  { key: 'FACEFOOD', label: '🎨 FACEFOOD' },
  { key: 'PIZARRA', label: '💎 PIZARRA NATURAL' }
]

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

  // Filter artworks by curatorial series or medium
  const filteredArtworks = ARTWORKS.filter(art => {
    if (filter === 'TODAS') return true
    if (filter === 'DIVINOS') return art.series === 'divinos' || art.title.toLowerCase().includes('marilyn') || art.title.toLowerCase().includes('amy') || art.title.toLowerCase().includes('james') || art.title.toLowerCase().includes('johnny') || art.title.toLowerCase().includes('divino')
    if (filter === 'VAIVENES') return art.series === 'vaivenes' || art.title.toLowerCase().includes('celia') || art.title.toLowerCase().includes('baroque') || art.medium.toLowerCase().includes('vaivenes')
    if (filter === 'ESPEJOS') return art.series === 'espejos' || art.title.toLowerCase().includes('dakari') || art.title.toLowerCase().includes('pensadora') || art.title.toLowerCase().includes('espejo')
    if (filter === 'FACEFOOD') return art.series === 'facefood' || art.title.toLowerCase().includes('cantinflas') || art.title.toLowerCase().includes('audrey') || art.title.toLowerCase().includes('conserva') || art.title.toLowerCase().includes('lata')
    if (filter === 'PIZARRA') return art.medium.toLowerCase().includes('pizarra')
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
            key={cat.key}
            onClick={() => {
              sound.playTick()
              setFilter(cat.key)
            }}
            style={{
              padding: '10px 22px',
              borderRadius: '30px',
              background: filter === cat.key ? 'rgba(255, 0, 122, 0.2)' : 'rgba(255,255,255,0.03)',
              border: filter === cat.key ? '1px solid #FF007A' : '1px solid rgba(255,255,255,0.12)',
              color: filter === cat.key ? '#FFE600' : 'rgba(255,255,255,0.7)',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none',
              boxShadow: filter === cat.key ? '0 0 20px rgba(255, 0, 122, 0.4), 0 0 10px rgba(255, 230, 0, 0.3)' : 'none'
            }}
          >
            {cat.label}
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
