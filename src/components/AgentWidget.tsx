"use client";

import { useState, useRef, useEffect } from 'react';

export default function AgentWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'agent', content: string }[]>([
    { role: 'agent', content: '¿Qué necesitas saber sobre la obra de Naroa?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: inputValue }]);
    setInputValue('');

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'agent', 
        content: 'Conexión C5-REAL pendiente de backend. Estoy preparado para procesar consultas sobre técnica mixta, hiperrealismo pop y kintsugi.' 
      }]);
    }, 800);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#0A0A0A] border border-[#2B3BE5]/30 flex items-center justify-center text-[#EAEAEA] transition-all duration-500 z-50 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        style={{
          boxShadow: isHovered ? '0 0 30px rgba(43,59,229,0.4), inset 0 0 10px rgba(43,59,229,0.2)' : '0 0 20px rgba(43,59,229,0.15)'
        }}
        aria-label="Abrir asistente de IA"
      >
        <div className="relative w-5 h-5 flex items-center justify-center">
          <div className="absolute inset-0 border border-[#2B3BE5] rounded-full animate-ping opacity-30"></div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-[#2B3BE5]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        </div>
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-[380px] h-[550px] max-h-[80vh] max-w-[calc(100vw-3rem)] bg-[#050505]/95 border border-[#2B3BE5]/30 flex flex-col transition-all duration-500 origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100 pointer-events-auto shadow-[0_0_50px_rgba(43,59,229,0.15)]' : 'scale-95 opacity-0 pointer-events-none'}`}
        style={{ backdropFilter: 'blur(16px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2B3BE5]/20 bg-gradient-to-b from-[#2B3BE5]/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#2B3BE5] animate-pulse shadow-[0_0_8px_#2B3BE5]"></div>
            <div>
              <h3 className="font-outfit font-medium text-sm text-[#EAEAEA] tracking-wide">CORTEX OMEGA</h3>
              <p className="font-mono text-[10px] text-[#EAEAEA]/50 uppercase tracking-widest">Naroart Agent</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-[#EAEAEA]/50 hover:text-[#EAEAEA] transition-colors p-1"
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#2B3BE5]/30 hover:[&::-webkit-scrollbar-thumb]:bg-[#2B3BE5]/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col max-w-[88%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
              <div 
                className={`p-3.5 rounded-sm font-outfit text-[13px] leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[#2B3BE5]/15 text-[#EAEAEA] border border-[#2B3BE5]/40 shadow-[inset_0_0_10px_rgba(43,59,229,0.1)]' 
                    : 'bg-[#0A0A0A] text-[#EAEAEA]/90 border border-white/10'
                }`}
              >
                {msg.content}
              </div>
              <span className="font-mono text-[9px] text-[#EAEAEA]/30 mt-1.5 uppercase tracking-wider">
                {msg.role === 'user' ? 'GUEST_0X' : 'SYS_CORTEX'}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 border-t border-[#2B3BE5]/20 bg-[#0A0A0A]/80">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Inicializar consulta..."
              className="w-full bg-[#111] border border-white/10 text-sm font-outfit text-[#EAEAEA] placeholder:text-[#EAEAEA]/30 px-4 py-3.5 outline-none focus:border-[#2B3BE5]/60 transition-colors rounded-sm"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-2 p-2 text-[#2B3BE5] hover:text-white disabled:opacity-30 disabled:hover:text-[#2B3BE5] transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
