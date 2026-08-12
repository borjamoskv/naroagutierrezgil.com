import React from 'react'

export function PremiumFooter({ onOpenEasterEgg, onOpenEspejo }) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="premium-footer" style={{
      position: 'relative',
      zIndex: 10,
      pointerEvents: 'auto',
      background: 'linear-gradient(to top, #050508 0%, transparent 100%)',
      padding: '80px 40px 40px',
      borderTop: '1px solid rgba(255,255,255,0.05)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        gap: '40px'
      }}>
        {/* Brand */}
        <div>
          <h3 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '2rem',
            fontWeight: 800,
            color: '#FFF',
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #FFF 0%, rgba(255,255,255,0.5) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            NAROA
          </h3>
          <p style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.1em'
          }}>
            Hiperrealismo POP · Bilbao
          </p>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <a href="mailto:naroa@naroa.eu" className="premium-footer-link" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s' }}>
            Email
          </a>
          <a href="https://www.instagram.com/naroa_art/" target="_blank" rel="noopener noreferrer" className="premium-footer-link" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s' }}>
            Instagram
          </a>
          <a href="https://www.facebook.com/naroa.artista.plastica" target="_blank" rel="noopener noreferrer" className="premium-footer-link" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s' }}>
            Facebook
          </a>
          <button onClick={onOpenEspejo} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', padding: 0 }}>
            Espejo del Alma ✨
          </button>
        </div>

        {/* Copyright */}
        <div style={{
          width: '100%',
          marginTop: '40px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.3)',
          fontFamily: 'Share Tech Mono, monospace'
        }}>
          <span>© {currentYear} Naroa Gutiérrez Gil</span>
          <button 
            onClick={onOpenEasterEgg}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'rgba(255,255,255,0.2)', 
              fontSize: '0.75rem', 
              cursor: 'pointer',
              fontFamily: 'Share Tech Mono, monospace',
              transition: 'color 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.color = '#F59E0B'}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.2)'}
          >
            A O R A N
          </button>
        </div>
      </div>
    </footer>
  )
}
