import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface OptionItem {
  id: string
  label: string
  sublabel: string
  badge?: string
  icon: string
}

const SUBJECT_OPTIONS: OptionItem[] = [
  { id: 'individual', label: 'Retrato Individual', sublabel: '1 rostro (Familiar, Autoretrato, Icono)', icon: '👤' },
  { id: 'couple', label: 'Pareja / Dúo', sublabel: '2 personas (Parejas, Hermanos, Amigos)', icon: '👥' },
  { id: 'pet', label: 'Retrato de Mascota', sublabel: 'Perros, gatos, animales de compañía', icon: '🐶' },
  { id: 'icon', label: 'Icono Pop Personalizado', sublabel: 'Tributo a artista, músico o mito pop', icon: '⚡' },
  { id: 'family', label: 'Familia / Grupo', sublabel: '3 o más figuras en composición', icon: '✨' },
]

const MEDIUM_OPTIONS: OptionItem[] = [
  { id: 'slate_mica', label: 'Pizarra Natural + Mica Mineral', sublabel: 'Técnica sobre pizarra con destellos de mica mineral', badge: 'DESTACADO', icon: '💎' },
  { id: 'canvas_3d', label: 'Lienzo 3D + Acrílico', sublabel: 'Grosor especial con textura gestual e hiperrealismo', icon: '🖼️' },
  { id: 'gold_mixed', label: 'Mixed Media + Pan de Oro', sublabel: 'Integración de pan de oro puros y acrílico', badge: 'EXCLUSIVO', icon: '🌟' },
]

const SIZE_OPTIONS: OptionItem[] = [
  { id: 'small', label: 'Formato Íntimo (30 × 40 cm)', sublabel: 'Para espacios acogedores o escritorio', icon: '📐' },
  { id: 'medium', label: 'Formato Medio (50 × 70 cm)', sublabel: 'El formato estándar para salón o estudio', badge: 'RECOMENDADO', icon: '🎨' },
  { id: 'large', label: 'Formato Grande (100 × 80 cm)', sublabel: 'Gran formato de alto impacto visual', icon: '🏛️' },
  { id: 'custom', label: 'Medida Especial', sublabel: 'Para proyectos específicos o formatos a medida', icon: '✂️' },
]

const FAQS = [
  {
    q: '¿Qué necesito para encargar un retrato personalizado?',
    a: 'Solo necesitas una o varias fotos de buena calidad con iluminación clara. Naroa te asesorará personalmente en la elección de la foto ideal para convertirla en obra de arte.'
  },
  {
    q: '¿Cómo se definen los plazos de entrega?',
    a: 'El proceso artesanal requiere tiempo según complejidad y formato. Naroa acuerda contigo los plazos y te envía fotografías de los avances durante la creación.'
  },
  {
    q: '¿Cómo se realizan los envíos?',
    a: 'Las obras se embalan con protección de alta resistencia y se envían aseguradas a cualquier punto de España y del extranjero.'
  },
  {
    q: '¿Se entregan con Certificado de Autenticidad?',
    a: 'Sí, cada obra incluye el Certificado de Autenticidad firmado por Naroa Gutiérrez Gil, detallando la fecha y materiales originales.'
  }
]

export function CommissionCalculator() {
  const [subject, setSubject] = useState<string>('individual')
  const [medium, setMedium] = useState<string>('slate_mica')
  const [size, setSize] = useState<string>('medium')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const selectedSubject = SUBJECT_OPTIONS.find(s => s.id === subject) || SUBJECT_OPTIONS[0]
  const selectedMedium = MEDIUM_OPTIONS.find(m => m.id === medium) || MEDIUM_OPTIONS[0]
  const selectedSize = SIZE_OPTIONS.find(sz => sz.id === size) || SIZE_OPTIONS[1]

  const summaryText = `Hola Naroa! Me gustaría consultar un encargo de retrato personalizado:
- Sujeto: ${selectedSubject.label} (${selectedSubject.icon})
- Soporte/Técnica: ${selectedMedium.label} (${selectedMedium.icon})
- Formato: ${selectedSize.label} (${selectedSize.icon})

¿Podemos hablar de la propuesta?`

  const whatsappUrl = `https://wa.me/34636060609?text=${encodeURIComponent(summaryText)}`
  const mailtoUrl = `mailto:naroa@naroa.eu?subject=${encodeURIComponent(`Consulta Encargo - ${selectedSubject.label}`)}&body=${encodeURIComponent(summaryText)}`

  return (
    <div className="commission-page brutal-container">
      {/* Ticker Marquesina */}
      <div className="brutal-marquee-bar">
        <div className="brutal-marquee-content">
          <span>⚡ RETRATOS POR ENCARGO EN BILBAO · CADA OBRA ES ÚNICA · MICA MINERAL & PIZARRA NATURAL ⚡</span>
          <span>⚡ RETRATOS POR ENCARGO EN BILBAO · CADA OBRA ES ÚNICA · MICA MINERAL & PIZARRA NATURAL ⚡</span>
        </div>
      </div>

      <header className="commission-header">
        <span className="brutal-badge brutal-badge--pink">ENCARGOS PERSONALIZADOS</span>
        <h1 className="brutal-title">
          CONSULTA TU <span className="highlight-yellow">RETRATO</span>
        </h1>
        <p className="brutal-subtitle">
          Transforma una fotografía en una obra de arte hiperrealista sobre pizarra, mica mineral o lienzo.
          Selecciona las opciones a continuación y contacta directamente con Naroa para recibir una propuesta personalizada.
        </p>
      </header>

      <div className="commission-grid">
        {/* Panel Izquierdo: Selección paso a paso */}
        <div className="calculator-panel">
          {/* PASO 1: Sujeto */}
          <div className="calc-step-card brutal-card">
            <div className="step-num-badge">01</div>
            <h2 className="step-title">¿A quién quieres retratar?</h2>
            <div className="options-grid">
              {SUBJECT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`opt-btn brutal-btn ${subject === opt.id ? 'active' : ''}`}
                  onClick={() => setSubject(opt.id)}
                >
                  <span className="opt-icon">{opt.icon}</span>
                  <div className="opt-text">
                    <span className="opt-label">{opt.label}</span>
                    <span className="opt-sub">{opt.sublabel}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* PASO 2: Técnica & Soporte */}
          <div className="calc-step-card brutal-card">
            <div className="step-num-badge">02</div>
            <h2 className="step-title">Elige Soporte & Técnica</h2>
            <div className="options-grid">
              {MEDIUM_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`opt-btn brutal-btn ${medium === opt.id ? 'active' : ''}`}
                  onClick={() => setMedium(opt.id)}
                >
                  {opt.badge && <span className="opt-badge">{opt.badge}</span>}
                  <span className="opt-icon">{opt.icon}</span>
                  <div className="opt-text">
                    <span className="opt-label">{opt.label}</span>
                    <span className="opt-sub">{opt.sublabel}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* PASO 3: Formato */}
          <div className="calc-step-card brutal-card">
            <div className="step-num-badge">03</div>
            <h2 className="step-title">Selecciona el Formato</h2>
            <div className="options-grid">
              {SIZE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  className={`opt-btn brutal-btn ${size === opt.id ? 'active' : ''}`}
                  onClick={() => setSize(opt.id)}
                >
                  {opt.badge && <span className="opt-badge opt-badge--cyan">{opt.badge}</span>}
                  <span className="opt-icon">{opt.icon}</span>
                  <div className="opt-text">
                    <span className="opt-label">{opt.label}</span>
                    <span className="opt-sub">{opt.sublabel}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel Derecho: Resumen & Contacto Directo */}
        <div className="summary-panel">
          <div className="brutal-card summary-card sticky-card">
            <div className="summary-top">
              <span className="brutal-tag brutal-tag--green">PRESUPUESTO A MEDIDA</span>
              <div className="price-display">
                <span className="price-range" style={{ fontSize: '1.5rem', color: '#D4AF37' }}>Consulta Directa</span>
                <span className="price-note">*Sin compromiso. Asesoramiento directo según la foto de referencia</span>
              </div>
            </div>

            <div className="summary-specs">
              <div className="spec-item">
                <span className="spec-key">Sujeto</span>
                <span className="spec-val">{selectedSubject.icon} {selectedSubject.label}</span>
              </div>
              <div className="spec-item">
                <span className="spec-key">Soporte</span>
                <span className="spec-val">{selectedMedium.icon} {selectedMedium.label}</span>
              </div>
              <div className="spec-item">
                <span className="spec-key">Formato</span>
                <span className="spec-val">{selectedSize.icon} {selectedSize.label}</span>
              </div>
            </div>

            <div className="guarantees-box">
              <div className="g-item">✓ Certificado de Autenticidad Firmado</div>
              <div className="g-item">✓ Embalaje seguro de madera/protección</div>
              <div className="g-item">✓ Seguimiento de avances durante la creación</div>
            </div>

            <div className="action-buttons">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="brutal-cta-btn brutal-cta-btn--whatsapp"
              >
                💬 CONSULTAR POR WHATSAPP
              </a>
              <a
                href={mailtoUrl}
                className="brutal-cta-btn brutal-cta-btn--email"
              >
                ✉️ CONSULTAR POR EMAIL
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Sección Proceso de Encargo */}
      <section className="process-section">
        <h2 className="section-brutal-title">
          PROCESO DE <span className="highlight-pink">CREACIÓN</span>
        </h2>
        <div className="process-grid">
          <div className="process-card brutal-card">
            <div className="process-num">01</div>
            <h3>Contacto & Fotos</h3>
            <p>Envías tus fotos de referencia y comentáis la idea personal o el regalo a realizar.</p>
          </div>
          <div className="process-card brutal-card">
            <div className="process-num">02</div>
            <h3>Composición & Formato</h3>
            <p>Definís la composición, tonos y materiales (pizarra, mica, lienzo) antes de iniciar.</p>
          </div>
          <div className="process-card brutal-card">
            <div className="process-num">03</div>
            <h3>Pintura & Seguimiento</h3>
            <p>Naroa pinta la obra y te comparte el proceso progresivo.</p>
          </div>
          <div className="process-card brutal-card">
            <div className="process-num">04</div>
            <h3>Entrega & Certificado</h3>
            <p>Envío protegido con su Certificado de Autenticidad oficial firmado por Naroa.</p>
          </div>
        </div>
      </section>

      {/* FAQ Sección */}
      <section className="faq-section">
        <h2 className="section-brutal-title">
          PREGUNTAS <span className="highlight-cyan">FRECUENTES</span>
        </h2>
        <div className="faq-list">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="faq-item brutal-card">
              <button
                className="faq-question-btn"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <span>{faq.q}</span>
                <span className="faq-arrow">{openFaq === idx ? '−' : '+'}</span>
              </button>
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="faq-answer-content"
                  >
                    <p>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
