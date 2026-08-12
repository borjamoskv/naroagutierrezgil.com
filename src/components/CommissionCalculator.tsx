
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Especificaciones de Formatos ───
const FORMATS = [
  { id: 'busto', label: 'Busto', sub: '30x40cm', price: 350, icon: '🗿' },
  { id: 'medio_cuerpo', label: 'Medio Cuerpo', sub: '40x60cm', price: 450, icon: '👤' },
  { id: 'cuerpo_entero', label: 'Cuerpo Entero', sub: '50x70cm', price: 550, icon: '🧍' },
  { id: 'gran_formato', label: 'Gran Formato', sub: '70x100cm+', price: 850, icon: '🖼️' }
]

// ─── Soportes ───
const SUPPORTS = [
  { id: 'lienzo', label: 'Lienzo Clásico', sub: 'Algodón premium', mult: 1.0, icon: '🎨' },
  { id: 'pizarra', label: 'Pizarra Vasca', sub: 'Recuperada de tejado', mult: 1.3, icon: '🪨' },
  { id: 'mica', label: 'Pizarra + Mica', sub: 'Destello mineral', mult: 1.6, icon: '✨' }
]

// ─── Técnicas ───
const TECHNIQUES = [
  { id: 'hiperrealismo', label: 'Hiperrealismo', sub: 'Máximo detalle', mult: 1.0, icon: '🔬' },
  { id: 'pop', label: 'Pop Art', sub: 'Colores vibrantes', mult: 1.1, icon: '⚡' },
  { id: 'mixta', label: 'Técnica Mixta', sub: 'Collage y texturas', mult: 1.2, icon: '🧩' }
]

export function CommissionCalculator() {
  const [format, setFormat] = useState(FORMATS[1])
  const [support, setSupport] = useState(SUPPORTS[0])
  const [technique, setTechnique] = useState(TECHNIQUES[0])

  const basePrice = format.price
  const finalPrice = Math.round(basePrice * support.mult * technique.mult)
  const minPrice = Math.round(finalPrice * 0.9)
  const maxPrice = Math.round(finalPrice * 1.1)

  const waMessage = `Hola Naroa! Estoy interesado/a en un retrato por encargo.%0A%0A- Formato: ${format.label} (${format.sub})%0A- Soporte: ${support.label}%0A- Técnica: ${technique.label}%0A%0APresupuesto estimado: €${minPrice} - €${maxPrice}%0A%0A¿Podemos hablar sobre los detalles?`

  return (
    <div style={{
      minHeight: '100vh',
      padding: '120px 24px 80px',
      maxWidth: '1200px',
      margin: '0 auto',
      pointerEvents: 'auto'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="premium-badge premium-badge--gold">Calculadora de Encargos</span>
        <h1 className="premium-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '16px' }}>
          Tu Retrato <span className="highlight-gold">Soñado</span>
        </h1>
        <p className="premium-subtitle" style={{ maxWidth: '600px', marginBottom: '48px' }}>
          Configura tu pieza única. Cada retrato es una conversación entre tu historia y mi pincel.
        </p>

        <div className="commission-main-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
          
          {/* Columna Izquierda: Configurador */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Paso 1: Formato */}
            <motion.div className="premium-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <span className="premium-badge">1</span>
                <h3 style={{ margin: 0, color: '#FFF' }}>Elige el Formato</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {FORMATS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f)}
                    className={`premium-btn ${format.id === f.id ? 'premium-btn--primary' : ''}`}
                    style={{ justifyContent: 'flex-start', padding: '16px' }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{f.icon}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700 }}>{f.label}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{f.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Paso 2: Soporte */}
            <motion.div className="premium-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <span className="premium-badge">2</span>
                <h3 style={{ margin: 0, color: '#FFF' }}>Elige el Soporte</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {SUPPORTS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSupport(s)}
                    className={`premium-btn ${support.id === s.id ? 'premium-btn--primary' : ''}`}
                    style={{ justifyContent: 'flex-start', padding: '16px' }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700 }}>{s.label}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{s.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Paso 3: Técnica */}
            <motion.div className="premium-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <span className="premium-badge">3</span>
                <h3 style={{ margin: 0, color: '#FFF' }}>Elige la Técnica</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {TECHNIQUES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTechnique(t)}
                    className={`premium-btn ${technique.id === t.id ? 'premium-btn--primary' : ''}`}
                    style={{ justifyContent: 'flex-start', padding: '16px' }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{t.icon}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700 }}>{t.label}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{t.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

          </div>

          {/* Columna Derecha: Resumen Sticky */}
          <div>
            <motion.div 
              className="premium-card"
              style={{ position: 'sticky', top: '120px', border: '1px solid rgba(245, 158, 11, 0.4)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div style={{ borderBottom: '1px dashed rgba(255,255,255,0.2)', paddingBottom: '20px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#FFF' }}>Resumen del Encargo</h3>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Formato:</span> <strong>{format.label}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Soporte:</span> <strong>{support.label}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Técnica:</span> <strong>{technique.label}</strong>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontFamily: 'Share Tech Mono, monospace' }}>
                  PRESUPUESTO ESTIMADO
                </div>
                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#F59E0B', lineHeight: 1 }}>
                  €{minPrice} - €{maxPrice}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
                  *Precio final tras valoración de fotos
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a 
                  href={`https://wa.me/34644430834?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="premium-btn premium-btn--primary"
                  style={{ width: '100%', padding: '16px', fontSize: '1.1rem', justifyContent: 'center' }}
                >
                  <span style={{ fontSize: '1.2rem' }}>💬</span> Solicitar por WhatsApp
                </a>
                <a 
                  href={`mailto:naroa@naroa.eu?subject=Encargo: Retrato ${format.label}&body=Hola Naroa,%0A%0AMe interesa un retrato con estas especificaciones:%0A- Formato: ${format.label} (${format.sub})%0A- Soporte: ${support.label}%0A- Técnica: ${technique.label}%0A%0AGracias!`}
                  className="premium-btn"
                  style={{ width: '100%', padding: '14px', justifyContent: 'center' }}
                >
                  <span>✉️</span> Solicitar por Email
                </a>
              </div>

              <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>✅ Certificado de autenticidad incluido</div>
                <div>✅ Envío asegurado a toda España</div>
                <div>✅ Fotos del proceso creativo</div>
                <div>✅ Pago fraccionado disponible</div>
              </div>
            </motion.div>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
