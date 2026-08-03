'use client';

import React, { useState } from 'react';

interface InquiryDrawerProps {
  artworkTitle?: string;
}

export const InquiryDrawer: React.FC<InquiryDrawerProps> = ({ artworkTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: artworkTitle ? `Deseo solicitar información privada sobre la obra "${artworkTitle}".` : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
    }, 2500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-mono text-xs tracking-[0.2em] uppercase rounded border border-white/10 transition-all duration-300 font-bold flex items-center justify-center gap-2"
      >
        <span>✉️</span> Solicitar Dossier Privado para Coleccionistas
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#0A0A0C] border-l border-white/10 h-full p-8 flex flex-col justify-between overflow-y-auto animate-slide-left">
            <div>
              <div className="flex justify-between items-center pb-6 border-b border-white/10 mb-8">
                <div>
                  <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-[#F59E0B]">
                    CONSULTA VIP
                  </span>
                  <h3 className="text-xl font-serif text-white">Dossier & Visita Privada</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-400 hover:text-white text-lg"
                >
                  ✕
                </button>
              </div>

              {submitted ? (
                <div className="bg-[#141418] border border-[#F59E0B]/50 p-6 rounded text-center my-12">
                  <span className="text-3xl mb-2 block">✨</span>
                  <h4 className="text-base font-serif text-[#F59E0B]">Solicitud Recibida</h4>
                  <p className="text-xs text-neutral-300 font-light mt-2 leading-relaxed">
                    El taller de Naroa Gutiérrez Gil contactará directamente a tu correo con el dossier confidencial.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej. Carmen de Icaza"
                      className="w-full bg-[#141418] border border-white/10 rounded px-4 py-3 text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="coleccionista@galeria.com"
                      className="w-full bg-[#141418] border border-white/10 rounded px-4 py-3 text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
                      Teléfono Directo (Opcional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+34 600 000 000"
                      className="w-full bg-[#141418] border border-white/10 rounded px-4 py-3 text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">
                      Mensaje / Interés
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-[#141418] border border-white/10 rounded px-4 py-3 text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-[#F59E0B] hover:bg-[#2B3BE5] text-black hover:text-white font-mono text-xs uppercase tracking-widest font-bold rounded transition-colors"
                  >
                    Enviar Solicitud Confidencial
                  </button>
                </form>
              )}
            </div>

            <div className="pt-6 border-t border-white/10 text-[9px] font-mono text-neutral-500 text-center">
              Atención directa por Naroa Gutiérrez Gil — Bilbao, España
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InquiryDrawer;
