

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sound } from '../utils/audio'

interface OptionItem {
  id: string
  label: string
  sublabel: string
  badge?: string
  icon: string
}

const SUBJECT_OPTIONS: OptionItem[] = [
  { id: 'individual', label: 'Retrato Individual', sublabel: '1 rostro (Alma, Mimo y Calma)', icon: '👤' },
  { id: 'couple', label: 'Pareja / Dúo', sublabel: '2 figuras (Vínculos y Espejos emocionales)', icon: '👥' },
  { id: 'pet', label: 'Compañero Animal', sublabel: 'Mascotas en técnica mixta sobre piedra', icon: '🐶' },
  { id: 'icon', label: 'Icono POP Personalizado', sublabel: 'Tributo mitológico (Música, Cine, Arte)', icon: '⚡' },
  { id: 'family', label: 'Familia / Composición', sublabel: '3 o más rostros en ensamble matérico', icon: '✨' },
]

const MEDIUM_OPTIONS: OptionItem[] = [
  { id: 'slate_mica', label: 'Pizarra Natural + Escamas de Mica Mineral', sublabel: 'Piedra de derribo vasco de Bizkaia con destellos de cuarzo', badge: 'EXCLUSIVO', icon: '💎' },
  { id: 'canvas_3d', label: 'Lienzo de Gran Formato + Acrílico', sublabel: 'Soporte textil con textura gestual e hiperrealismo', icon: '🖼️' },
  { id: 'gold_mixed', label: 'Serie «Facefood» / Conserva Emocional', sublabel: 'Lata de conserva o collage vinílico en cola blanca', badge: 'POP ART', icon: '🥫' },
]

const SIZE_OPTIONS: OptionItem[] = [
  { id: 'small', label: 'Formato Íntimo (30 × 40 cm)', sublabel: 'Para espacio personal o escritorio', icon: '📐' },
  { id: 'medium', label: 'Formato Estudio (50 × 70 cm)', sublabel: 'Formato estándar de alto impacto visual', badge: 'RECOMENDADO', icon: '🎨' },
  { id: 'large', label: 'Formato Monumental (100 × 80 cm)', sublabel: 'Gran escala para coleccionistas', icon: '🏛️' },
  { id: 'custom', label: 'Medida Especial', sublabel: 'Proyecto a medida para espacio específico', icon: '✂️' },
]

const FAQS = [
  {
    q: '¿Cómo empieza el proceso de un encargo privado?',
    a: '«Cada retrato empieza con una conversación». Solo necesitas enviar una o varias fotos de referencia. Naroa te asesora en la elección de la toma ideal para plasmarla sobre pizarra natural o lienzo.'
  },
  {
    q: '¿Cómo se definen la técnica y los tiempos de creación?',
    a: 'El proceso artesanal se realiza a fuego lento con «mimo y calma» desde el taller en Bolueta (Bilbao). Naroa comparte fotos del avance del retrato sobre la piedra o lienzo.'
  },
  {
    q: '¿Cómo se embala y envía la obra?',
    a: 'La obra se embala en caja protegida de alta resistencia y se envía asegurada a cualquier punto de España o del extranjero.'
  },
  {
    q: '¿Se entrega con Certificado de Autenticidad?',
    a: 'Sí, cada encargo incluye el Certificado de Autenticidad oficial firmado por Naroa Gutiérrez Gil, detallando la fecha y la trazabilidad de los materiales (pizarra, mica, acrílico).'
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

  const summaryText = `Hola Naroa! Quisiera consultar la disponibilidad de un encargo de retrato personalizado desde tu web:
- Sujeto: ${selectedSubject.label} (${selectedSubject.icon})
- Soporte / Técnica: ${selectedMedium.label} (${selectedMedium.icon})
- Formato: ${selectedSize.label} (${selectedSize.icon})

«Cada retrato empieza con una conversación». ¿Podemos coordinar la propuesta?`

  const whatsappUrl = `https://wa.me/34636060609?text=${encodeURIComponent(summaryText)}`
  const mailtoUrl = `mailto:naroa@naroa.eu?subject=${encodeURIComponent(`Consulta Encargo Privado — ${selectedSubject.label}`)}&body=${encodeURIComponent(summaryText)}`

  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '100px auto 80px', padding: '0 24px' }}>
      {/* Marquee Banner */}
      <div style={{
        background: 'rgba(255, 0, 122, 0.12)',
        border: '1px solid rgba(255, 0, 122, 0.3)',
        borderRadius: '30px',
        padding: '10px 24px',
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#FF007A', fontWeight: 800 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF007A', boxShadow: '0 0 10px #FF007A' }} />
          ESKAERAK // ENCARGOS PRIVADOS POR NAROA GUTIÉRREZ GIL
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#FFE600', fontWeight: 700 }}>
          ⚡ PIZARRA NATURAL DE TEJADO VASCO & MICA MINERAL · BILBAO
        </span>
      </div>

      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={{
          fontSize: '0.75rem',
          padding: '6px 16px',
          background: 'rgba(0, 240, 255, 0.15)',
          border: '1px solid rgba(0, 240, 255, 0.4)',
          borderRadius: '30px',
          color: '#00F0FF',
          fontFamily: 'var(--font-mono)',
          fontWeight: 800,
          letterSpacing: '0.1em'
        }}>
          💎 ENCARGOS PRIVADOS & RETRATOS DE AUTOR
        </span>
        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 4rem)',
          fontWeight: 900,
          color: '#fff',
          margin: '16px 0 12px 0',
          letterSpacing: '-0.03em'
        }}>
          RETRATOS CON <span className="text-pop-gradient">MIMO Y CALMA</span>
        </h1>
        <p style={{
          fontSize: '1.05rem',
          color: 'rgba(255, 255, 255, 0.75)',
          maxWidth: '680px',
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          «Cada retrato empieza con una conversación». Precios transparentes y sin sorpresas. Selecciona el formato ideal o personaliza tu encargo a medida desde el taller en Bilbao.
        </p>

        {/* Guarantee & Urgency Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '24px' }}>
          <div style={{ padding: '8px 16px', borderRadius: '100px', background: 'rgba(37, 211, 102, 0.12)', border: '1px solid rgba(37, 211, 102, 0.4)', color: '#25D366', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
            🛡️ GARANTÍA: 100% Devolución del anticipo previo al boceto
          </div>
          <div style={{ padding: '8px 16px', borderRadius: '100px', background: 'rgba(255, 230, 0, 0.12)', border: '1px solid rgba(255, 230, 0, 0.4)', color: '#FFE600', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
            ⏳ CUPO LIMITADO: 3 Encargos al mes (Plazo actual: 3-4 semanas)
          </div>
        </div>
      </header>

      {/* 💳 PRICING TIERS SECTION (CRO OPTIMIZED) */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: '24px', fontFamily: 'var(--font-mono)' }}>
          FORMATOS Y TARIFAS DE REFERENCIA
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {/* BÁSICO */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backdropFilter: 'blur(12px)' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#00F0FF', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>FORMATO ÍNTIMO</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: '8px 0' }}>BÁSICO</h3>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFE600', margin: '12px 0' }}>350 €</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>📐 Busto (30 × 40 cm)</li>
                <li>🪨 Acrílico sobre pizarra natural o lienzo</li>
                <li>👤 1 Persona / Rostro</li>
                <li>⏱️ Plazo: 2 semanas</li>
                <li>✏️ 1 Revisión de boceto incluida</li>
              </ul>
            </div>
            <button
              onClick={() => { sound.playOpen(); setSize('small'); setSubject('individual') }}
              style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0, 240, 255, 0.15)', border: '1px solid #00F0FF', color: '#00F0FF', fontWeight: 800, cursor: 'pointer', width: '100%' }}
            >
              SELECCIONAR BÁSICO
            </button>
          </div>

          {/* ESTÁNDAR (MÁS POPULAR) */}
          <div style={{ background: 'rgba(255, 0, 122, 0.08)', border: '2px solid #FF007A', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', boxShadow: '0 0 30px rgba(255,0,122,0.25)', backdropFilter: 'blur(12px)' }}>
            <span style={{ position: 'absolute', top: '-14px', right: '20px', background: '#FF007A', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>MÁS POPULAR</span>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#FF007A', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>FORMATO ESTUDIO</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: '8px 0' }}>ESTÁNDAR</h3>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFE600', margin: '12px 0' }}>550 €</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>📐 Cuerpo entero / Busto amplio (50 × 70 cm)</li>
                <li>💎 Pizarra vasca + Mica Mineral & Resina Epoxi</li>
                <li>👥 1 o 2 Personas</li>
                <li>⏱️ Plazo: 3 semanas</li>
                <li>✏️ 2 Revisiones de boceto incluidas</li>
              </ul>
            </div>
            <button
              onClick={() => { sound.playOpen(); setSize('medium'); setMedium('slate_mica') }}
              style={{ padding: '14px', borderRadius: '12px', background: '#FF007A', border: 'none', color: '#fff', fontWeight: 900, cursor: 'pointer', width: '100%', boxShadow: '0 0 15px rgba(255, 0, 122, 0.5)' }}
            >
              SELECCIONAR ESTÁNDAR
            </button>
          </div>

          {/* PREMIUM */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backdropFilter: 'blur(12px)' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#FFE600', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>FORMATO MONUMENTAL</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: '8px 0' }}>PREMIUM</h3>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFE600', margin: '12px 0' }}>850 €</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>📐 Gran formato (70 × 100 cm)</li>
                <li>🏛️ Mixed Media completo (Pizarra, Mica, Kintsugi Oro)</li>
                <li>✨ Hasta 3 Personas / Composición compleja</li>
                <li>⏱️ Plazo: 4 semanas</li>
                <li>✏️ Revisiones de boceto ilimitadas + Marco artesanal</li>
              </ul>
            </div>
            <button
              onClick={() => { sound.playOpen(); setSize('large'); setSubject('family') }}
              style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255, 230, 0, 0.15)', border: '1px solid #FFE600', color: '#FFE600', fontWeight: 800, cursor: 'pointer', width: '100%' }}
            >
              SELECCIONAR PREMIUM
            </button>
          </div>
        </div>
      </section>

      {/* Main Commission Selector Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px', alignItems: 'start' }}>
        {/* Left Options Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* STEP 1: Subject */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ background: '#FF007A', color: '#fff', padding: '2px 10px', borderRadius: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900 }}>01</span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>¿A quién quieres retratar?</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {SUBJECT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { sound.playTick(); setSubject(opt.id) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 18px',
                    borderRadius: '14px',
                    background: subject === opt.id ? 'rgba(255, 0, 122, 0.18)' : 'rgba(255, 255, 255, 0.02)',
                    border: subject === opt.id ? '1px solid #FF007A' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: subject === opt.id ? '#FFE600' : '#fff' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)', fontFamily: 'var(--font-mono)' }}>{opt.sublabel}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: Medium */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ background: '#FFE600', color: '#000', padding: '2px 10px', borderRadius: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900 }}>02</span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Elige Soporte & Técnica Matérica</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {MEDIUM_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { sound.playTick(); setMedium(opt.id) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 18px',
                    borderRadius: '14px',
                    background: medium === opt.id ? 'rgba(255, 230, 0, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    border: medium === opt.id ? '1px solid #FFE600' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    position: 'relative'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: medium === opt.id ? '#FFE600' : '#fff' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)', fontFamily: 'var(--font-mono)' }}>{opt.sublabel}</div>
                  </div>
                  {opt.badge && (
                    <span style={{ position: 'absolute', right: '14px', top: '14px', fontSize: '0.6rem', padding: '2px 8px', background: 'rgba(255,0,122,0.2)', border: '1px solid #FF007A', color: '#FF007A', borderRadius: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                      {opt.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: Size */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ background: '#00F0FF', color: '#000', padding: '2px 10px', borderRadius: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 900 }}>03</span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Selecciona el Formato</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {SIZE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { sound.playTick(); setSize(opt.id) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 18px',
                    borderRadius: '14px',
                    background: size === opt.id ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    border: size === opt.id ? '1px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: size === opt.id ? '#00F0FF' : '#fff' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)', fontFamily: 'var(--font-mono)' }}>{opt.sublabel}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Summary & Contact Card */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div style={{ background: 'rgba(10, 8, 16, 0.95)', border: '1px solid rgba(212, 175, 55, 0.4)', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', backdropFilter: 'blur(16px)' }}>
            <span style={{ fontSize: '0.7rem', padding: '4px 12px', background: 'rgba(214, 175, 55, 0.15)', border: '1px solid rgba(214, 175, 55, 0.5)', color: '#D4AF37', borderRadius: '20px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
              💎 ASESORAMIENTO DIRECTO DE LA ARTISTA
            </span>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: '16px 0 4px 0' }}>
              Propuesta Personalizada
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', margin: 0, fontFamily: 'var(--font-mono)' }}>
              *Sin compromiso. Coordinación directa según tu foto de referencia.
            </p>

            <div style={{ margin: '24px 0', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>
                <strong>Sujeto:</strong> {selectedSubject.icon} {selectedSubject.label}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#00F0FF' }}>
                <strong>Soporte:</strong> {selectedMedium.icon} {selectedMedium.label}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#FFE600' }}>
                <strong>Formato:</strong> {selectedSize.icon} {selectedSize.label}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
              <div>✓ Certificado de Autenticidad Oficial Firmado</div>
              <div>✓ Seguimiento de avances durante la creación</div>
              <div>✓ Envío protegido nacional e internacional</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sound.playOpen()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  textDecoration: 'none',
                  boxShadow: '0 0 20px rgba(37, 211, 102, 0.4)'
                }}
              >
                💬 HABLAR POR WHATSAPP CON NAROA
              </a>

              <a
                href={mailtoUrl}
                onClick={() => sound.playTick()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                ✉️ CONSULTAR POR EMAIL
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section style={{ marginTop: '80px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: '32px' }}>
          PREGUNTAS FRECUENTES SOBRE <span className="text-pop-gradient">ENCARGOS</span>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '840px', margin: '0 auto' }}>
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                overflow: 'hidden'
              }}
            >
              <button
                onClick={() => { sound.playTick(); setOpenFaq(openFaq === idx ? null : idx) }}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1rem',
                  fontWeight: 800,
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <span>{faq.q}</span>
                <span style={{ color: '#FFE600', fontSize: '1.2rem' }}>{openFaq === idx ? '−' : '+'}</span>
              </button>
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ padding: '0 24px 20px 24px', color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.92rem', lineHeight: 1.6 }}
                  >
                    <p style={{ margin: 0 }}>{faq.a}</p>
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
