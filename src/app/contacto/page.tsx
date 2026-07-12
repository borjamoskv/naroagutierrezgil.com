'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useLenis from '@/hooks/useLenis';
import HeroFluid from '@/components/HeroFluid';
import ScrollReveal from '@/components/ScrollReveal';
import Footer from '@/components/Footer';
import GlobalNavigation from '@/components/GlobalNavigation';

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    tipo: 'individual',
    tamano: 'mediano',
    inversion: '500-1500',
    detalles: ''
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useLenis();

  // Calcular estimación en caliente (C5-REAL logic)
  const getEstimatedPrice = () => {
    let min = 0;
    let max = 0;

    // Lógica base según tipo
    if (formData.tipo === 'mascota') {
      if (formData.tamano === 'pequeno') { min = 250; max = 350; }
      else if (formData.tamano === 'mediano') { min = 380; max = 480; }
      else if (formData.tamano === 'grande') { min = 550; max = 680; }
      else { min = 680; max = 1200; }
    } else if (formData.tipo === 'individual') {
      if (formData.tamano === 'pequeno') { min = 350; max = 450; }
      else if (formData.tamano === 'mediano') { min = 480; max = 600; }
      else if (formData.tamano === 'grande') { min = 680; max = 850; }
      else { min = 850; max = 1500; }
    } else if (formData.tipo === 'doble') {
      if (formData.tamano === 'pequeno') { min = 500; max = 650; }
      else if (formData.tamano === 'mediano') { min = 750; max = 900; }
      else if (formData.tamano === 'grande') { min = 980; max = 1200; }
      else { min = 1200; max = 2200; }
    } else { // Otros / Composición libre
      if (formData.tamano === 'pequeno') { min = 400; max = 600; }
      else if (formData.tamano === 'mediano') { min = 600; max = 1000; }
      else if (formData.tamano === 'grande') { min = 1000; max = 1800; }
      else { min = 1800; max = 3500; }
    }

    return { min, max };
  };

  const estimatedPrice = getEstimatedPrice();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('sending');

    const tipoLabel = formData.tipo === 'mascota' ? 'Mascota' : formData.tipo === 'individual' ? 'Retrato Individual' : formData.tipo === 'doble' ? 'Retrato Pareja / Doble' : 'Composición Especial';
    const tamanoLabel = formData.tamano === 'pequeno' ? 'Pequeño (20x30 cm)' : formData.tamano === 'mediano' ? 'Mediano (30x40 cm)' : formData.tamano === 'grande' ? 'Grande (40x60 cm)' : 'Tamaño Personalizado';
    const inversionLabel = formData.inversion === 'bajo' ? 'Menos de 500€' : formData.inversion === '500-1500' ? 'Entre 500€ y 1500€' : 'Más de 1500€';

    const subject = encodeURIComponent(`Propuesta de Obra: ${tipoLabel} - ${formData.nombre}`);
    const body = encodeURIComponent(`Hola Naroa,

Soy ${formData.nombre} (${formData.email}) y me gustaría encargar una obra.

DETALLES TÉCNICOS:
------------------
- Tipo: ${tipoLabel}
- Tamaño: ${tamanoLabel}
- Presupuesto Previsto: ${inversionLabel}
- Estimación de la Calculadora: ${estimatedPrice.min}€ - ${estimatedPrice.max}€

IDEA / CONCEPTO:
----------------
${formData.detalles}

¡Espero tus comentarios!
`);

    // Abre el cliente de correo por defecto
    window.location.href = `mailto:naroa.gutierrez.gil@gmail.com?subject=${subject}&body=${body}`;
    
    // Asumimos éxito al abrir el cliente
    setTimeout(() => {
      setSubmitStatus('success');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA] font-sans selection:bg-[#2B3BE5] selection:text-white overflow-hidden">
      {/* Background FX */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[50vw] h-[50vw] bg-[#2B3BE5] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse" />
        <HeroFluid />
      </div>

      {/* Navigation */}
      <GlobalNavigation />

      <main id="main-content" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pt-40 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* HEADER & INFO SECTION */}
          <div className="lg:col-span-5 space-y-12">
            <ScrollReveal>
            <header className="relative border-l border-[#2B3BE5]/30 pl-8 py-2">
              <span className="text-[#2B3BE5] font-sans tracking-[0.4em] uppercase text-[10px] mb-4 block">
                Cimientos de Pizarra
              </span>
              <h1 className="text-5xl sm:text-7xl font-serif font-light tracking-wide uppercase text-white leading-none">
                Establecer<br />Contacto
              </h1>
            </header>
            </ScrollReveal>

            <div className="space-y-6 text-white/60 font-light text-lg leading-relaxed">
              <p>
                Cada encargo es una conversación silenciosa que se plasma en piedra. No pinto lienzos en serie; cincelo identidades sobre <strong className="text-white">pizarra natural de tejados derruidos</strong> y mica mineral.
              </p>
              <p>
                Usa este formulario para configurar una propuesta inicial. Al enviarlo, recibiré tu solicitud directamente y responderé en 24-48 horas.
              </p>
            </div>

            {/* TABLA DE INVERSIÓN */}
            <ScrollReveal delay={0.15}>
            <div className="p-8 border border-white/5 bg-white/[0.01] rounded-sm space-y-6">
              <h3 className="text-[#2B3BE5] font-serif text-2xl">Rangos de Inversión</h3>
              <div className="space-y-4 text-sm font-sans tracking-wide">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/80">Mascotas (20x30 cm)</span>
                  <span className="text-[#2B3BE5]">desde 250€</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/80">Retrato Individual (30x40 cm)</span>
                  <span className="text-[#2B3BE5]">desde 450€</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/80">Retrato Doble (40x60 cm)</span>
                  <span className="text-[#2B3BE5]">desde 750€</span>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed pt-2">
                  * El coste final de la obra se determina por el tamaño final seleccionado de la pizarra, la pureza geológica y las horas de cincelado.
                </p>
              </div>
            </div>
            </ScrollReveal>
          </div>

          {/* FORM SECTION */}
          <ScrollReveal delay={0.2}>
          <div className="lg:col-span-7 bg-[#0A0A0A] border border-white/10 rounded-sm p-8 sm:p-12 shadow-2xl relative magnetic-glow">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#2B3BE5]" />

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* NOMBRE */}
              <div className="flex flex-col gap-2">
                <label htmlFor="nombre" className="font-sans text-[10px] tracking-widest uppercase text-white/40">Nombre Completo</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Introduce tu nombre"
                  className="bg-white/5 border border-white/10 focus:border-[#2B3BE5]/50 focus:outline-none px-4 py-3 text-sm font-sans rounded-sm transition-colors text-white"
                />
              </div>

              {/* EMAIL */}
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="font-sans text-[10px] tracking-widest uppercase text-white/40">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className="bg-white/5 border border-white/10 focus:border-[#2B3BE5]/50 focus:outline-none px-4 py-3 text-sm font-sans rounded-sm transition-colors text-white"
                />
              </div>

              {/* TIPO Y TAMAÑO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="tipo" className="font-sans text-[10px] tracking-widest uppercase text-white/40">Tipo de Retrato</label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="bg-white/5 border border-white/10 focus:border-[#2B3BE5]/50 focus:outline-none px-4 py-3 text-sm font-sans rounded-sm transition-colors text-white cursor-pointer"
                  >
                    <option value="mascota" className="bg-[#0A0A0A]">🐾 Mascota</option>
                    <option value="individual" className="bg-[#0A0A0A]">👤 Retrato Individual</option>
                    <option value="doble" className="bg-[#0A0A0A]">👥 Retrato Doble / Pareja</option>
                    <option value="otro" className="bg-[#0A0A0A]">✨ Composición Especial</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="tamano" className="font-sans text-[10px] tracking-widest uppercase text-white/40">Tamaño Estimado</label>
                  <select
                    id="tamano"
                    name="tamano"
                    value={formData.tamano}
                    onChange={handleChange}
                    className="bg-white/5 border border-white/10 focus:border-[#2B3BE5]/50 focus:outline-none px-4 py-3 text-sm font-sans rounded-sm transition-colors text-white cursor-pointer"
                  >
                    <option value="pequeno" className="bg-[#0A0A0A]">📏 Pequeño (20x30 cm)</option>
                    <option value="mediano" className="bg-[#0A0A0A]">📏 Mediano (30x40 cm)</option>
                    <option value="grande" className="bg-[#0A0A0A]">📏 Grande (40x60 cm)</option>
                    <option value="personalizado" className="bg-[#0A0A0A]">📐 Personalizado / Especial</option>
                  </select>
                </div>
              </div>

              {/* RANGO DE INVERSIÓN PREVISTO (Solicitado en Quick-Wins) */}
              <div className="flex flex-col gap-3">
                <label className="font-sans text-[10px] tracking-widest uppercase text-white/40">Rango de Inversión Previsto</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'bajo', label: '< 500€' },
                    { id: '500-1500', label: '500€ - 1500€' },
                    { id: 'alto', label: '> 1500€' }
                  ].map((inv) => (
                    <label 
                      key={inv.id} 
                      className={`flex items-center justify-center p-4 border rounded-sm cursor-pointer transition-all duration-300 font-sans text-xs tracking-wider uppercase ${
                        formData.inversion === inv.id
                          ? 'border-[#2B3BE5] bg-[#2B3BE5]/10 text-white shadow-[0_0_15px_rgba(43,59,229,0.1)]'
                          : 'border-white/10 bg-white/[0.02] text-white/50 hover:border-white/20'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="inversion" 
                        value={inv.id} 
                        checked={formData.inversion === inv.id} 
                        onChange={handleChange} 
                        className="sr-only" 
                      />
                      {inv.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* DETALLES DE LA PROPUESTA */}
              <div className="flex flex-col gap-2">
                <label htmlFor="detalles" className="font-sans text-[10px] tracking-widest uppercase text-white/40">Detalles de la Idea</label>
                <textarea
                  id="detalles"
                  name="detalles"
                  rows={4}
                  required
                  value={formData.detalles}
                  onChange={handleChange}
                  placeholder="Describe qué deseas capturar, referencias de luz, colores preferidos o historia de la obra..."
                  className="bg-white/5 border border-white/10 focus:border-[#2B3BE5]/50 focus:outline-none px-4 py-3 text-sm font-sans rounded-sm transition-colors text-white placeholder-white/20 resize-none"
                />
              </div>

              {/* PRESUPUESTO ESTIMADO (C5-REAL Micro-interacción) */}
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <span className="font-sans text-[9px] tracking-widest uppercase text-white/40 block mb-1">Estimación Técnica aproximada</span>
                  <span className="font-serif text-3xl text-white font-light">
                    {estimatedPrice.min}€ - {estimatedPrice.max}€
                  </span>
                </div>
                <button
                  id="btn-submit-contacto"
                  type="submit"
                  disabled={submitStatus === 'sending' || submitStatus === 'success'}
                  className={`w-full sm:w-auto px-10 py-5 font-mono text-[10px] tracking-[0.3em] uppercase rounded-sm transition-all duration-700 cursor-pointer ${
                    submitStatus === 'success'
                      ? 'bg-emerald-600 text-white shadow-[0_0_40px_rgba(16,185,129,0.25)]'
                      : submitStatus === 'error'
                        ? 'bg-red-700 text-white hover:bg-red-600 shadow-[0_0_40px_rgba(220,38,38,0.25)]'
                        : 'bg-[#2B3BE5] text-white hover:bg-white hover:text-black shadow-[0_0_40px_rgba(43,59,229,0.25)] hover:shadow-[0_0_60px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98]'
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {submitStatus === 'sending' ? 'Enviando...' : submitStatus === 'success' ? '✓ Enviado' : submitStatus === 'error' ? 'Error — Reintentar' : 'Enviar Propuesta'}
                </button>
              </div>

              {submitStatus === 'success' && (
                <p className="text-[#2B3BE5] font-mono text-[10px] tracking-widest mt-4 text-center">
                  Propuesta recibida. Responderemos en 24-48h.
                </p>
              )}
              {submitStatus === 'error' && (
                <p className="text-red-500 font-mono text-[10px] tracking-widest mt-4 text-center">
                  Error al enviar. Verifica tu conexión e inténtalo de nuevo.
                </p>
              )}

            </form>
          </div>
          </ScrollReveal>

        </div>
      </main>

      <Footer />
    </div>
  );
}
