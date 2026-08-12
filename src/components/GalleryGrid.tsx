import React, { useState } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { artworks } from '../data/artworks'

// Componente de Tarjeta con Efecto Tilt 3D
function TiltCard({ children, onClick, className }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [6, -6])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-6, 6])
  
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['100%', '0%'])
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['100%', '0%'])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    x.set(mouseX / width - 0.5)
    y.set(mouseY / height - 0.5)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
        cursor: 'pointer'
      }}
      whileHover={{ scale: 1.02, zIndex: 10 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 80%)',
          opacity: 0,
          zIndex: 2,
          pointerEvents: 'none'
        }}
        animate={{
          background: useTransform(
            [glareX, glareY],
            ([gx, gy]) => `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.3) 0%, transparent 60%)`
          )
        }}
        whileHover={{ opacity: 1 }}
      />
      {children}
    </motion.div>
  )
}

export function GalleryGrid({ onOpenArtwork }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const categories = ['all', ...new Set(artworks.map(a => a.category))]

  const filteredArtworks = artworks.filter(art => {
    const matchesFilter = filter === 'all' || art.category === filter
    const matchesSearch = art.title.toLowerCase().includes(search.toLowerCase()) || 
                          art.description.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div style={{
      minHeight: '100vh',
      padding: '120px 24px 80px',
      maxWidth: '1600px',
      margin: '0 auto',
      pointerEvents: 'auto'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="premium-badge premium-badge--gold">Colección Completa</span>
        <h1 className="premium-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '16px' }}>
          Universo <span className="highlight-gold">Artístico</span>
        </h1>
        <p className="premium-subtitle" style={{ maxWidth: '600px', marginBottom: '48px' }}>
          Explora las series: Rocks, DiviNos, Tributos Musicales y En.Lata. Cada pieza es un fragmento de alma sobre pizarra.
        </p>

        {/* Controles */}
        <div className="gallery-filter-bar" style={{ display: 'flex', gap: '16px', marginBottom: '32px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar obra..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '30px',
              padding: '12px 24px',
              color: '#FFF',
              fontFamily: 'Outfit, sans-serif',
              outline: 'none',
              flex: 1,
              minWidth: '200px'
            }}
          />
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`premium-btn ${filter === cat ? 'premium-btn--primary' : ''}`}
                style={{ whiteSpace: 'nowrap', padding: '8px 20px', fontSize: '0.8rem' }}
              >
                {cat === 'all' ? 'Todas' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {filteredArtworks.map((art, index) => {
            const realIndex = artworks.findIndex(a => a.id === art.id)
            return (
              <motion.div
                key={art.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                layout
              >
                <TiltCard 
                  className="premium-card" 
                  style={{ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
                  onClick={() => onOpenArtwork(realIndex)}
                >
                  <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden' }}>
                    <img 
                      src={art.src} 
                      alt={art.title} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                      loading="lazy"
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)',
                      opacity: 0.8
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      right: '16px'
                    }}>
                      <span className="premium-badge" style={{ marginBottom: '8px', background: 'rgba(0,0,0,0.6)' }}>
                        {art.category}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#FFF', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        {art.title}
                      </h3>
                    </div>
                  </div>
                  <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                      {art.year}
                    </span>
                    <span style={{ color: '#F59E0B', fontSize: '0.9rem' }}>Ver →</span>
                  </div>
                </TiltCard>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
