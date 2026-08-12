import { sound } from '../utils/audio'

export function PremiumFooter() {
  return (
    <footer className="premium-footer-v2" style={{
      width: '100%',
      background: 'linear-gradient(180deg, rgba(5, 5, 8, 0.8) 0%, rgba(3, 3, 5, 0.98) 100%)',
      borderTop: '1px solid rgba(255, 0, 122, 0.25)',
      backdropFilter: 'blur(20px)',
      padding: '60px 5vw 30px 5vw',
      marginTop: '80px',
      color: '#FFFFFF',
      position: 'relative',
      zIndex: 20
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        {/* Col 1: Brand & Manifesto */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '1.4rem', fontWeight: 900, letterSpacing: '0.12em' }}>
            NAROA GUTIÉRREZ GIL<span style={{ color: '#FF007A' }}>.</span>
          </div>
          <p style={{
            fontSize: '0.88rem',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: 1.6,
            margin: 0,
            maxWidth: '360px'
          }}>
            Hiperrealismo POP & Investigaciones Líticas sobre pizarra natural de derribos en Bizkaia y mica mineral. Retratos con alma, mimo y calma desde el taller de Bolueta, Bilbao.
          </p>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: '#FFE600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#39FF14', boxShadow: '0 0 10px #39FF14' }} />
            TALLER ABIERTO EN BILBAO (BOLUETA)
          </div>
        </div>

        {/* Col 2: Navigation & Social Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            letterSpacing: '0.15em',
            color: '#00F0FF',
            margin: 0,
            textTransform: 'uppercase'
          }}>
            ✦ EXPLORACIÓN & REDES
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <a href="#/gallery" onClick={() => sound.playTick()} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.2s' }}>
                🎨 Colección Completa (150+ Obras)
              </a>
            </li>
            <li>
              <a href="#/3d" onClick={() => sound.playTick()} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.2s' }}>
                🕶️ Sala 3D FPS Inmersiva
              </a>
            </li>
            <li>
              <a href="#/sobre-mi" onClick={() => sound.playTick()} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.2s' }}>
                📖 Manifiesto & Biografía
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/naroa_art/" target="_blank" rel="noopener noreferrer" style={{ color: '#FF007A', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600 }}>
                📸 Instagram Official (@naroa_art) ↗
              </a>
            </li>
            <li>
              <a href="https://www.facebook.com/naroa.artista.plastica" target="_blank" rel="noopener noreferrer" style={{ color: '#00F0FF', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600 }}>
                📘 Facebook Artista (12K+ Seguidores) ↗
              </a>
            </li>
            <li>
              <a href="https://naroagutierrez.wordpress.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#FFE600', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600 }}>
                📝 Blog Oficial en WordPress ↗
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Direct Contact & Commissions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            letterSpacing: '0.15em',
            color: '#FFE600',
            margin: 0,
            textTransform: 'uppercase'
          }}>
            ⚡ ENCARGOS & CONTACTO
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', margin: 0, lineHeight: 1.5 }}>
            ¿Quieres encargar un retrato personalizado o consultar sobre una obra original?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a
              href="https://wa.me/34600000000?text=Hola%20Naroa,%20me%20gustaria%20consultar%20sobre%20un%20encargo%20de%20retrato"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playTick()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: '#39FF14',
                color: '#000000',
                borderRadius: '30px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 900,
                textDecoration: 'none',
                boxShadow: '0 0 15px rgba(57, 255, 20, 0.4)'
              }}
            >
              💬 WHATSAPP DIRECTO CON NAROA
            </a>
            <a
              href="mailto:naroa@naroa.eu"
              onClick={() => sound.playTick()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'rgba(255, 0, 122, 0.15)',
                border: '1px solid #FF007A',
                color: '#FF007A',
                borderRadius: '30px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              ✉️ NAROARTE@HOTMAIL.COM
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Telemetry Bar */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-mono)',
        color: 'rgba(255, 255, 255, 0.4)'
      }}>
        <div>
          © 2026 NAROA GUTIÉRREZ GIL · TODOS LOS DERECHOS RESERVADOS
        </div>
        <div style={{ color: '#D4AF37' }}>
          🎵 BSO SOTA: Boards of Burgos (Borja Moskv)
        </div>
        <div style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          BOLUETA // 43.2497° N, 2.9067° W
        </div>
      </div>
    </footer>
  )
}

