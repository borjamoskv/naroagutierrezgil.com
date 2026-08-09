import { useState, useEffect, useRef } from 'react'
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
        padding: '2px'
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
            ? '0 30px 60px rgba(0,0,0,0.9), 0 0 40px rgba(255, 0, 122, 0.35)' 
            : '0 10px 30px rgba(0,0,0,0.5)',
          border: isHovered ? '1px solid #FF007A' : '1px solid rgba(255,255,255,0.05)',
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
              transform: 'translateZ(1px)'
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
              background: 'rgba(255, 0, 122, 0.18)',
              border: '1px solid #FF007A',
              borderRadius: '20px',
              color: '#FFE600',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              letterSpacing: '0.05em'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(24)

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

  // Reset pagination count on filter/search change
  useEffect(() => {
    setVisibleCount(24)
  }, [filter, searchQuery])

  // Filter artworks by search query + curatorial series/medium
  const filteredArtworks = ARTWORKS.filter(art => {
    // Search query match
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim()
      const matchTitle = art.title.toLowerCase().includes(q)
      const matchMedium = art.medium.toLowerCase().includes(q)
      const matchYear = String(art.year).includes(q)
      const matchCategory = art.category ? art.category.toLowerCase().includes(q) : false
      if (!matchTitle && !matchMedium && !matchYear && !matchCategory) return false
    }

    // Category filter match
    if (filter === 'TODAS') return true
    if (filter === 'DIVINOS') return art.series === 'divinos' || art.title.toLowerCase().includes('marilyn') || art.title.toLowerCase().includes('amy') || art.title.toLowerCase().includes('james') || art.title.toLowerCase().includes('johnny') || art.title.toLowerCase().includes('divino')
    if (filter === 'VAIVENES') return art.series === 'vaivenes' || art.title.toLowerCase().includes('celia') || art.title.toLowerCase().includes('baroque') || art.medium.toLowerCase().includes('vaivenes')
    if (filter === 'ESPEJOS') return art.series === 'espejos' || art.title.toLowerCase().includes('dakari') || art.title.toLowerCase().includes('pensadora') || art.title.toLowerCase().includes('espejo')
    if (filter === 'FACEFOOD') return art.series === 'facefood' || art.title.toLowerCase().includes('cantinflas') || art.title.toLowerCase().includes('audrey') || art.title.toLowerCase().includes('conserva') || art.title.toLowerCase().includes('lata')
    if (filter === 'PIZARRA') return art.medium.toLowerCase().includes('pizarra')
    return true
  })

  const visibleArtworks = filteredArtworks.slice(0, visibleCount)

  // Masonry column distribution
  const cols: typeof ARTWORKS[] = Array.from({ length: columns }, () => [])
  const heights = new Array(columns).fill(0)

  visibleArtworks.forEach((art) => {
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
      {/* Search & Stats Header Bar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '28px',
        width: '100%',
        maxWidth: '640px'
      }}>
        {/* Search Input Box */}
        <div style={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{
            position: 'absolute',
            left: '16px',
            color: '#00F0FF',
            fontSize: '1rem',
            pointerEvents: 'none'
          }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar por obra, icono, material (Pizarra, Mica, Amy, Marilyn...)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 44px 14px 46px',
              borderRadius: '30px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: searchQuery ? '1px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.12)',
              color: '#fff',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              outline: 'none',
              transition: 'all 0.3s ease',
              boxShadow: searchQuery ? '0 0 20px rgba(0, 240, 255, 0.25)' : 'none'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Counter Badge */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'rgba(255, 255, 255, 0.6)',
          letterSpacing: '0.08em'
        }}>
          MOSTRANDO <span style={{ color: '#FFE600', fontWeight: 800 }}>{visibleArtworks.length}</span> DE <span style={{ color: '#FF007A', fontWeight: 800 }}>{filteredArtworks.length}</span> OBRAS CATALOGADAS
        </div>
      </div>

      {/* Premium Category Filter Bar */}
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

      {/* Masonry Grid */}
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

      {/* Progressive Load More Button */}
      {visibleCount < filteredArtworks.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: '50px' }}
        >
          <button
            onClick={() => {
              sound.playOpen()
              setVisibleCount(prev => prev + 24)
            }}
            style={{
              padding: '16px 36px',
              borderRadius: '40px',
              background: 'linear-gradient(135deg, rgba(255, 0, 122, 0.25) 0%, rgba(0, 240, 255, 0.25) 100%)',
              border: '1px solid rgba(255, 230, 0, 0.6)',
              color: '#FFE600',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              cursor: 'pointer',
              boxShadow: '0 0 30px rgba(255, 0, 122, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            ⚡ CARGAR MÁS OBRAS ({filteredArtworks.length - visibleCount} RESTANTES)
          </button>
        </motion.div>
      )}
    </div>
  )
}
