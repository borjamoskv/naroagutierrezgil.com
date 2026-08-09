import { motion } from 'framer-motion'
import { ARTWORKS } from '../artworks'
import { sound } from '../utils/audio'

interface GalleryGridProps {
  onInspect: (index: number) => void
}

export function GalleryGrid({ onInspect }: GalleryGridProps) {
  return (
    <div className="gallery-page brutal-container" style={{ paddingTop: '20px', paddingBottom: '80px', width: '100%' }}>
      {/* REJILLA GIGANTE DE OBRAS (CERO RELLENO DE TEXTO, MÁS IMPACTO VISUAL) */}
      <div 
        className="gigantic-artworks-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))',
          gap: '32px',
          width: '100%',
          maxWidth: '1920px',
          margin: '0 auto',
          padding: '0 20px'
        }}
      >
        {ARTWORKS.map((artwork, idx) => {
          return (
            <motion.div
              key={artwork.id}
              className="gigantic-artwork-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(idx * 0.03, 0.4) }}
              whileHover={{ scale: 1.018, y: -6 }}
              onClick={() => {
                sound.playOpen()
                onInspect(idx)
              }}
              style={{
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: '#0d0d12',
                boxShadow: '0 12px 35px rgba(0,0,0,0.7)'
              }}
            >
              <div className="gigantic-img-wrap" style={{ width: '100%', height: '560px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={artwork.url}
                  alt={artwork.title}
                  loading={idx < 4 ? "eager" : "lazy"}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    transition: 'transform 0.5s ease-out'
                  }}
                />
                <div 
                  className="gigantic-card-overlay"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 35%, transparent 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '24px',
                    pointerEvents: 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                        {artwork.title}
                      </h3>
                      <span style={{ fontSize: '0.88rem', color: '#D4AF37', fontFamily: 'var(--font-mono)', marginTop: '4px', display: 'block', fontWeight: 500 }}>
                        {artwork.medium}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px', color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {artwork.year}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
