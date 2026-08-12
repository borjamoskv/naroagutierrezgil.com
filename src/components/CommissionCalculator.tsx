
import { useState } from 'react'

interface CalculatorState {
  size: 'pequeño' | 'mediano' | 'grande' | 'gigante'
  material: 'lienzo' | 'pizarra' | 'mica'
  complexity: 'estandar' | 'hiperrealista'
  frame: 'sin_marco' | 'minimalista' | 'barroco'
}

export function CommissionCalculator() {
  const [state, setState] = useState<CalculatorState>({
    size: 'mediano',
    material: 'pizarra',
    complexity: 'hiperrealista',
    frame: 'sin_marco'
  })

  const sizePrices = {
    pequeño: 300,
    mediano: 600,
    grande: 1200,
    gigante: 2500
  }

  const materialMultipliers = {
    lienzo: 1.0,
    pizarra: 1.5,
    mica: 1.8
  }

  const complexityMultipliers = {
    estandar: 1.0,
    hiperrealista: 1.5
  }

  const framePrices = {
    sin_marco: 0,
    minimalista: 80,
    barroco: 250
  }

  const sizeLabels = {
    pequeño: 'Pequeño (30x40cm)',
    mediano: 'Mediano (50x70cm)',
    grande: 'Grande (80x120cm)',
    gigante: 'Gigante (100x150cm+)'
  }

  const materialLabels = {
    lienzo: 'Lienzo Tradicional',
    pizarra: 'Pizarra Natural Vasca',
    mica: 'Pizarra + Mica Mineral'
  }

  const complexityLabels = {
    estandar: 'Retrato Estándar',
    hiperrealista: 'Hiperrealismo POP'
  }

  const frameLabels = {
    sin_marco: 'Sin Marco (Cantos pintados)',
    minimalista: 'Marco Minimalista Negro',
    barroco: 'Marco Barroco Dorado'
  }

  const basePrice = sizePrices[state.size]
  const totalPrice = (basePrice * materialMultipliers[state.material] * complexityMultipliers[state.complexity]) + framePrices[state.frame]

  const summaryText = `Hola Naroa! Estoy interesado/a en encargar un retrato con las siguientes características:\n- Tamaño: ${sizeLabels[state.size]}\n- Soporte: ${materialLabels[state.material]}\n- Estilo: ${complexityLabels[state.complexity]}\n- Marco: ${frameLabels[state.frame]}\n\nPrecio estimado por el configurador: €${totalPrice.toFixed(0)}\n\nMe gustaría hablar contigo para concretar los detalles.`
  const waText = encodeURIComponent(summaryText)
  const mailtoBody = encodeURIComponent(summaryText + '\n\n(Enviado desde naroagutierrezgil.com)')

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '120px', paddingBottom: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="brutal-badge brutal-badge--yellow">✦ COMISIONES ABIERTAS</span>
        <h1 className="brutal-title" style={{ fontSize: '3rem', margin: '16px 0 8px 0' }}>
          CONFIGURADOR DE <span className="highlight-pink">ENCARGOS</span>
        </h1>
        <p className="brutal-subtitle" style={{ margin: '0 auto' }}>
          Diseña tu retrato hiperrealista personalizado. Cada retrato empieza con una conversación. Retratos con alma, mimo y calma.
        </p>
      </div>

      <div className="commission-grid">
        {/* Left: Form */}
        <div className="brutal-card" style={{ padding: '32px' }}>
          
          {/* 1. Tamaño */}
          <div className="calc-step-card">
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: 'var(--cobalt)', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>1</span>
              Selecciona el Tamaño
            </h3>
            <div className="options-grid">
              {(Object.keys(sizePrices) as Array<keyof typeof sizePrices>).map((s) => (
                <button
                  key={s}
                  className={`brutal-btn opt-btn ${state.size === s ? 'active' : ''}`}
                  onClick={() => setState({ ...state, size: s })}
                >
                  <div className="opt-text">
                    <span className="opt-label">{sizeLabels[s]}</span>
                    <span className="opt-sub">Desde €{sizePrices[s]}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Soporte */}
          <div className="calc-step-card">
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: 'var(--cobalt)', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>2</span>
              Soporte Matérico
            </h3>
            <div className="options-grid">
              {(Object.keys(materialMultipliers) as Array<keyof typeof materialMultipliers>).map((m) => (
                <button
                  key={m}
                  className={`brutal-btn opt-btn ${state.material === m ? 'active' : ''}`}
                  onClick={() => setState({ ...state, material: m })}
                >
                  <div className="opt-text">
                    <span className="opt-label">{materialLabels[m]}</span>
                    <span className="opt-sub">x{materialMultipliers[m].toFixed(1)} multiplicador</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Estilo */}
          <div className="calc-step-card">
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: 'var(--cobalt)', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>3</span>
              Estilo Artístico
            </h3>
            <div className="options-grid">
              {(Object.keys(complexityMultipliers) as Array<keyof typeof complexityMultipliers>).map((c) => (
                <button
                  key={c}
                  className={`brutal-btn opt-btn ${state.complexity === c ? 'active' : ''}`}
                  onClick={() => setState({ ...state, complexity: c })}
                >
                  <div className="opt-text">
                    <span className="opt-label">{complexityLabels[c]}</span>
                    <span className="opt-sub">x{complexityMultipliers[c].toFixed(1)} multiplicador</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Marco */}
          <div className="calc-step-card">
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: 'var(--cobalt)', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>4</span>
              Acabado y Enmarcado
            </h3>
            <div className="options-grid">
              {(Object.keys(framePrices) as Array<keyof typeof framePrices>).map((f) => (
                <button
                  key={f}
                  className={`brutal-btn opt-btn ${state.frame === f ? 'active' : ''}`}
                  onClick={() => setState({ ...state, frame: f })}
                >
                  <div className="opt-text">
                    <span className="opt-label">{frameLabels[f]}</span>
                    <span className="opt-sub">+€{framePrices[f]}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Summary Sticky */}
        <div>
          <div className="brutal-card sticky-card" style={{ borderColor: 'var(--gold)', boxShadow: '6px 6px 0 var(--gold)' }}>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '20px', borderBottom: '2px dashed rgba(255,255,255,0.2)', paddingBottom: '12px' }}>
              RESUMEN DEL ENCARGO
            </h3>
            
            <div className="price-display" style={{ textAlign: 'center', margin: '24px 0' }}>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Inversión Estimada</span>
              <span className="price-range" style={{ fontSize: '3rem', margin: '8px 0' }}>€{totalPrice.toFixed(0)}</span>
              <span className="price-note">Impuestos y envío incluidos en Península</span>
            </div>

            <div className="summary-specs">
              <div className="spec-item">
                <span className="spec-key">Tamaño</span>
                <span className="spec-val">{sizeLabels[state.size]}</span>
              </div>
              <div className="spec-item">
                <span className="spec-key">Soporte</span>
                <span className="spec-val">{materialLabels[state.material]}</span>
              </div>
              <div className="spec-item">
                <span className="spec-key">Estilo</span>
                <span className="spec-val">{complexityLabels[state.complexity]}</span>
              </div>
              <div className="spec-item">
                <span className="spec-key">Marco</span>
                <span className="spec-val">{frameLabels[state.frame]}</span>
              </div>
            </div>

            <div className="guarantees-box">
              <span>✓ Certificado de Autenticidad</span>
              <span>✓ Seguimiento del proceso (fotos)</span>
              <span>✓ Pago fraccionado disponible</span>
            </div>

            <div className="action-buttons">
              <a
                href={`https://wa.me/34636060609?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="brutal-cta-btn brutal-cta-btn--whatsapp"
              >
                💬 SOLICITAR POR WHATSAPP
              </a>
              <a
                href={`mailto:naroa@naroa.eu?subject=Nuevo Encargo Artístico&body=${mailtoBody}`}
                className="brutal-cta-btn brutal-cta-btn--email"
              >
                ✉️ SOLICITAR POR EMAIL
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
