import { useState } from 'react'
import { motion } from 'framer-motion'
import { sound } from '../utils/audio'

const EXHIBITIONS = [
  { year: '2026', title: '«DiviNos VaiVenes»', venue: 'Politena Espacio de Arte (Bilbao)', detail: 'Retratos pop sobre pizarra de tejado vasco con mineral de mica.' },
  { year: '2026', title: 'Bwall Collective «GIRLS»', venue: 'Dock Bilbao', detail: 'Muestra colectiva de artivismo, diversidad y feminismo.' },
  { year: '2026', title: '«Mujeres a través del Espejo»', venue: 'Marienea (Basauri)', detail: 'Retrospectiva temática de género y mirada.' },
  { year: '2026', title: 'Azoka Lataska', venue: 'Sopela (Bizkaia)', detail: 'Muestra costera y arte vivo en directo.' },
  { year: '2024', title: '«Espejos del Alma»', venue: 'Galería Vanguardia (Bilbao)', detail: 'Retrospectiva sobre la mirada y la psique humana.' },
  { year: '2024', title: '«Identity Fragments»', venue: 'Espacio Oculto (Madrid)', detail: 'Exposición de fragmentación matérica y técnica mixta.' },
  { year: '2023', title: 'POP Culture Icons', venue: 'Artsy Online', detail: 'Serie «Neon Dreams» e iconografía pop contemporánea.' },
  { year: '2022', title: '«Repóker de Reinas»', venue: 'Siarte Leku (Bilbao)', detail: '5 obras monumentales sobre la fragilidad de iconos femeninos.' },
  { year: '2021', title: 'Artistas Emergentes Euskadi', venue: 'Sala Rekalde (Bilbao)', detail: 'Obra seleccionada: «La Mirada Ausente».' },
  { year: '2020', title: 'Bilbao Art Market', venue: 'Plaza del Ensanche (Bilbao)', detail: 'Muestra de arte urbano e interacción social.' },
  { year: '2019', title: '«Mujeres Creadoras»', venue: 'Casa de Cultura de Getxo', detail: 'Exposición colectiva de visibilización del arte femenino.' },
  { year: '2015', title: '«Espejos del Alma» (Origen)', venue: 'Colegio de Abogados de Bizkaia', detail: 'Primera muestra individual sobre el retrato como espejo.' },
  { year: '2010', title: '«Espejos del Alma» (Inicio)', venue: 'Espacio Hegoak (Bilbao)', detail: 'Inauguración de la serie germinal de retratos.' }
]

const MATERIALS = [
  {
    title: 'Pizarra de Tejado Vasco',
    icon: '🪨',
    tag: 'ARQUEOLOGÍA INDUSTRIAL',
    desc: 'Material extraído de derribos arquitectónicos en Bizkaia. Piedra natural sellada con resina epoxi y pulido mineral que guarece el retrato como un tejado ancestral.'
  },
  {
    title: 'Mica Mineral Viva',
    icon: '💎',
    tag: 'LUMINESCENCIA NATURAL',
    desc: 'Láminas minerales adheridas que generan brillos iridiscentes y tornasolados reales según el ángulo de luz de la sala donde cuelga la obra.'
  },
  {
    title: 'Cantinflowers (Kintsugi)',
    icon: '✨',
    tag: 'TÉCNICA REGISTRADA',
    desc: 'Accidente creativo descubierto durante el confinamiento: reacción entre acrílico denso y cola blanca que genera una textura resquebrajada rellenada con pigmentos dorados.'
  },
  {
    title: 'Ojos de Cristal 3D',
    icon: '👁️',
    tag: 'EFECTO ÓPTICO',
    desc: 'Pupilas esculpidas con microcapas de barniz cerámico tridimensional aplicadas con palillo de precisión para reflejar los focos reales de la sala.'
  }
]

const PROCESS_STEPS = [
  { step: '01', title: 'Entrevista Psicológica', desc: 'Conversación profunda con el retratado para capturar la máscara emocional y el estado interno.' },
  { step: '02', title: 'Bocetado Conjunto', desc: 'Co-construcción de la composición estética, selección de colores y soportes matéricos.' },
  { step: '03', title: 'Trabajo Lítico & Pintura', desc: 'Aplicación de acrílico, pan de oro, capas de mica mineral y resinas en el taller de Bolueta.' },
  { step: '04', title: 'El Reverso Acústico', desc: 'Incorporación de cartas manuscritas ocultas y código QR con la BSO de música electrónica.' }
]

export function AboutSection() {
  const [activeExhibition, setActiveExhibition] = useState<number | null>(0)

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', paddingTop: '100px', paddingBottom: '60px' }}>

      {/* Hero Bio Card */}
      <div className="premium-card" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '40px',
        alignItems: 'center',
        marginBottom: '60px'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{ position: 'relative' }}
        >
          <img
            src="/assets/naroa-portrait-DW8XfHYG.jpg"
            alt="Naroa Gutiérrez Gil — Artista Visual en Bilbao"
            style={{
              width: '100%',
              borderRadius: '16px',
              border: '1px solid rgba(43, 59, 229, 0.3)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(43, 59, 229, 0.2)'
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            right: '16px',
            background: 'rgba(5, 5, 8, 0.85)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            padding: '12px 16px',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--gold-hi)',
            fontWeight: 700
          }}>
            📍 TALLER DE BOLUETA (BILBAO) · 1978
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <div>
            <span className="pop-badge pop-badge--pink">
              ⚡ HIPERREALISMO POP · ARTIVISMO
            </span>
          </div>

          <h1 className="premium-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', margin: 0, lineHeight: 1.1 }}>
            A O R A N / <span style={{ color: 'var(--gold-hi)' }}>N A R O A</span>
          </h1>

          <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>
            «A NAROA LA ORAN A» — PALÍNDROMO Y MIRADA ESPECULAR
          </p>

          <p className="premium-subtitle" style={{ fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
            Naroa Gutiérrez Gil (Bilbao, 1978) es una artivista autodidacta, pintora de hiperrealismo pop e investigadora matérica. Trasformando la pizarra natural de derribos vascos y la mica mineral en máscaras emocionales, Naroa concibe cada retrato no como una copia física, sino como un diálogo profundo sobre la identidad.
          </p>

          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            borderLeft: '3px solid var(--cobalt-soft)',
            padding: '12px 16px',
            borderRadius: '0 8px 8px 0',
            fontSize: '0.88rem',
            color: 'rgba(255, 255, 255, 0.9)',
            fontStyle: 'italic'
          }}>
            «Cada piedra que uso tiene millones de años. Cada retrato que pinto tiene la edad de quien lo mira.»
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
            <a
              href="https://www.facebook.com/naroa.artista.plastica"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playTick()}
              className="premium-btn premium-btn--primary"
              style={{ fontSize: '0.78rem' }}
            >
              📘 FACEBOOK ARTISTA (12K+ SEGUIDORES) ↗
            </a>
            <a
              href="#/encargos"
              onClick={() => sound.playOpen()}
              className="premium-btn"
              style={{ fontSize: '0.78rem', borderColor: 'var(--gold)', color: 'var(--gold)' }}
            >
              ⚡ ENCARGAR UN RETRATO
            </a>
          </div>
        </motion.div>
      </div>

      {/* Material Research Grid */}
      <div style={{ marginBottom: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="pop-badge pop-badge--cyan">✦ INVESTIGACIÓN MATÉRICA</span>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', marginTop: '12px' }}>
            SOPORTES RADICALES & TÉCNICAS REGISTRADAS
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {MATERIALS.map((mat, idx) => (
            <motion.div
              key={mat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="premium-card"
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ fontSize: '2rem' }}>{mat.icon}</div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--cobalt-soft)', fontWeight: 700, letterSpacing: '0.1em' }}>
                {mat.tag}
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                {mat.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6, margin: 0 }}>
                {mat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Creative Process Steps */}
      <div style={{ marginBottom: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="pop-badge pop-badge--yellow">⚡ CORE LOOP DE ENCARGO</span>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', marginTop: '12px' }}>
            EL PROCESO DE RETRATO CO-CREATIVO
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {PROCESS_STEPS.map((ps, idx) => (
            <motion.div
              key={ps.step}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              style={{
                background: 'rgba(10, 10, 15, 0.6)',
                border: '1px solid rgba(43, 59, 229, 0.2)',
                borderRadius: '16px',
                padding: '24px',
                position: 'relative'
              }}
            >
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '2rem',
                fontWeight: 900,
                color: 'var(--gold)',
                opacity: 0.6,
                marginBottom: '8px'
              }}>
                {ps.step}
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>
                {ps.title}
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: 0 }}>
                {ps.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Exhibition Timeline (2010 - 2026) */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="pop-badge pop-badge--gold">🏛️ TRAYECTORIA ARTÍSTICA</span>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF', marginTop: '12px' }}>
            REGISTRO HISTÓRICO DE EXPOSICIONES (2010 – 2026)
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {EXHIBITIONS.map((expo, idx) => (
            <motion.div
              key={`${expo.year}-${expo.title}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.05, 0.3) }}
              viewport={{ once: true }}
              onClick={() => {
                sound.playTick()
                setActiveExhibition(activeExhibition === idx ? null : idx)
              }}
              style={{
                background: activeExhibition === idx ? 'rgba(43, 59, 229, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: activeExhibition === idx ? '1px solid var(--cobalt)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '16px 24px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  color: 'var(--gold-hi)',
                  padding: '4px 10px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  borderRadius: '20px',
                  border: '1px solid rgba(245, 158, 11, 0.4)'
                }}>
                  {expo.year}
                </span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>{expo.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--cobalt-soft)', fontFamily: 'var(--font-mono)' }}>{expo.venue}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.7)', maxWidth: '400px' }}>
                {expo.detail}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
