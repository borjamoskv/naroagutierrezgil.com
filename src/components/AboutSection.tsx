import React, { useEffect } from 'react'
import { motion } from 'framer-motion'

const socialLinks = [
  { name: 'Instagram', url: 'https://www.instagram.com/naroa_art/', emoji: '📸' },
  { name: 'Facebook', url: 'https://www.facebook.com/naroa.artista.plastica', emoji: '📘' },
  { name: 'WhatsApp', url: 'https://wa.me/34644430834', emoji: '💬' },
  { name: 'Email', url: 'mailto:naroa@naroa.eu', emoji: '✉️' }
]

export function AboutSection({ onNavigate }) {
  useEffect(() => {
    document.title = 'Sobre Naroa Gutiérrez Gil — Artista Visual Bilbao'
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      padding: '120px 24px 60px',
      maxWidth: '1000px',
      margin: '0 auto',
      color: '#FFFFFF',
      pointerEvents: 'auto'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="premium-card"
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <span className="premium-badge premium-badge--gold">Artista Visual</span>
          <span className="premium-badge">Bilbao, ES</span>
          <span className="premium-badge">Hiperrealismo POP</span>
        </div>

        <h1 className="premium-title" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
          Sobre <span className="highlight-gold">Naroa</span>
        </h1>
        <p style={{ fontFamily: 'Share Tech Mono, monospace', color: '#FF9F1C', marginBottom: '24px', letterSpacing: '0.2em' }}>
          UNA NAROA · A O R A N
        </p>

        <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'rgba(255,255,255,0.85)' }}>
          <p style={{ marginBottom: '20px' }}>
            Soy Naroa Gutiérrez Gil, artista visual con estudio en <strong style={{ color: '#F59E0B' }}>Bolueta, Bilbao</strong>. Mi lenguaje es el <strong>Hiperrealismo POP</strong>: retratos que trascienden la fotografía para tocar el alma, pintados sobre soportes milenarios como la <strong style={{ color: '#F59E0B' }}>pizarra natural</strong> y el destello mágico de la <strong style={{ color: '#F59E0B' }}>mica mineral</strong>.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', margin: '24px 0' }}>
            <div className="premium-card" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#F59E0B' }}>12k+</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>Comunidad</div>
            </div>
            <div className="premium-card" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#F59E0B' }}>40+</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>Obras Originales</div>
            </div>
            <div className="premium-card" style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#F59E0B' }}>100%</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>Artesanal</div>
            </div>
          </div>

          <p style={{ marginBottom: '20px' }}>
            En cada trazo busco el equilibrio entre la precisión técnica del hiperrealismo y la vitalidad emocional del arte pop. Mis obras no solo se miran; se sienten. Uso la pizarra de tejado vasco recuperada, que trae consigo siglos de historia, y la mica, un mineral que refleja la luz de forma hipnótica, para crear piezas únicas que evolucionan con la luz del día.
          </p>
          <p style={{ marginBottom: '32px' }}>
            Especializada en <strong>retratos por encargo</strong>, trabajo contigo para capturar la esencia de tus seres queridos o tus iconos favoritos, transformando fotografías en piezas de arte atemporales. Cada encargo es un viaje compartido, desde el boceto inicial hasta el destello final de mica.
          </p>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px', marginTop: '32px' }}>
          <h3 style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '20px', letterSpacing: '0.2em' }}>
            CONECTA CONMIGO
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {socialLinks.map(link => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="premium-btn"
              >
                <span>{link.emoji}</span> {link.name}
              </a>
            ))}
          </div>
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <button onClick={() => onNavigate('encargos')} className="premium-btn premium-btn--primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
              ⚡ ENCARGAR MI RETRATO
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
