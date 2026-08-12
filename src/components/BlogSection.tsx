import React, { useEffect } from 'react'
import { motion } from 'framer-motion'

const blogPosts = [
  {
    id: 1,
    title: 'El Alma de la Pizarra Vasca',
    date: '15 Oct 2026',
    excerpt: 'Descubriendo el soporte perfecto para el hiperrealismo pop: la pizarra de tejado recuperada de Bilbao.',
    link: 'https://naroagutierrez.wordpress.com/'
  },
  {
    id: 2,
    title: 'Mica Mineral: El Destello del Alma',
    date: '02 Nov 2026',
    excerpt: 'Cómo la mica mineral transforma un retrato plano en una experiencia visual tridimensional que late.',
    link: 'https://naroagutierrez.wordpress.com/'
  },
  {
    id: 3,
    title: 'Retratos por Encargo: El Proceso',
    date: '20 Nov 2026',
    excerpt: 'Desde la fotografía de referencia hasta el último toque de oro. Un viaje compartido con el cliente.',
    link: 'https://naroagutierrez.wordpress.com/'
  }
]

export function BlogSection() {
  useEffect(() => {
    document.title = 'Bitácora — Naroa Gutiérrez Gil'
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      padding: '120px 24px 60px',
      maxWidth: '1200px',
      margin: '0 auto',
      pointerEvents: 'auto'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="premium-badge premium-badge--gold">Bitácora de Artista</span>
        <h1 className="premium-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '16px' }}>
          Diario de <span className="highlight-gold">Creación</span>
        </h1>
        <p className="premium-subtitle" style={{ maxWidth: '600px', marginBottom: '48px' }}>
          Pensamientos, procesos técnicos y las historias detrás de cada obra. Sincronizado con WordPress.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px'
        }}>
          {blogPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="premium-card"
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.8rem', color: '#FF9F1C', marginBottom: '12px' }}>
                {post.date}
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#FFF' }}>
                {post.title}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '24px', flexGrow: 1 }}>
                {post.excerpt}
              </p>
              <a 
                href={post.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="premium-btn"
                style={{ alignSelf: 'flex-start', marginTop: 'auto' }}
              >
                Leer en WordPress ↗
              </a>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
