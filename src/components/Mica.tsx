'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  sender: 'mica' | 'user';
  text: string;
  options?: { label: string; action: string }[];
}

const defaultInitialMessage: Message[] = [
  {
    sender: 'mica',
    text: 'Hola. Soy Otra Naro, el reflejo mineral en el taller de Naroa. ¿Quieres perpetuar una mirada, una mascota o un recuerdo en pizarra natural?',
    options: [
      { label: '🎨 Retrato por Encargo', action: 'custom_portrait' },
      { label: '💰 Ver Tarifas', action: 'view_rates' },
      { label: '✉️ Contacto Directo', action: 'direct_contact' }
    ]
  }
];

export default function Mica() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stage, setStage] = useState<'init' | 'type' | 'size' | 'summary'>('init');
  const [selections, setSelections] = useState({ type: '', size: '' });
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem('naroa_mica_messages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        setMessages(defaultInitialMessage);
      }
    } else {
      setMessages(defaultInitialMessage);
    }

    const savedStage = localStorage.getItem('naroa_mica_stage');
    if (savedStage) {
      setStage(savedStage as any);
    }

    const savedSelections = localStorage.getItem('naroa_mica_selections');
    if (savedSelections) {
      try {
        setSelections(JSON.parse(savedSelections));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('naroa_mica_messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('naroa_mica_stage', stage);
  }, [stage]);

  useEffect(() => {
    localStorage.setItem('naroa_mica_selections', JSON.stringify(selections));
  }, [selections]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleOptionClick = (action: string, label: string) => {
    // Add user message to log
    setMessages(prev => [...prev, { sender: 'user', text: label }]);

    setTimeout(() => {
      if (action === 'custom_portrait') {
        setStage('type');
        setMessages(prev => [
          ...prev,
          {
            sender: 'mica',
            text: 'Excelente elección. Un retrato en pizarra es eterno. ¿Qué tipo de retrato deseas realizar?',
            options: [
              { label: '🐾 Mascota', action: 'select_type_mascota' },
              { label: '👤 Individual', action: 'select_type_individual' },
              { label: '👥 Pareja / Doble', action: 'select_type_doble' }
            ]
          }
        ]);
      } else if (action.startsWith('select_type_')) {
        const type = action.replace('select_type_', '');
        const typeLabel = type === 'mascota' ? 'Mascota' : type === 'individual' ? 'Individual' : 'Pareja';
        setSelections(prev => ({ ...prev, type: typeLabel }));
        setStage('size');
        setMessages(prev => [
          ...prev,
          {
            sender: 'mica',
            text: `Perfecto, un retrato de tipo ${typeLabel}. ¿En qué formato y tamaño de pizarra te gustaría plasmarlo?`,
            options: [
              { label: '📏 Pequeño (20x30 cm)', action: 'select_size_pequeno' },
              { label: '📏 Mediano (30x40 cm)', action: 'select_size_mediano' },
              { label: '📏 Grande (40x60 cm)', action: 'select_size_grande' }
            ]
          }
        ]);
      } else if (action.startsWith('select_size_')) {
        const size = action.replace('select_size_', '');
        const sizeLabel = size === 'pequeno' ? '20x30 cm' : size === 'mediano' ? '30x40 cm' : '40x60 cm';
        const finalSelections = { ...selections, size: sizeLabel };
        setSelections(finalSelections);
        setStage('summary');

        // Estimate price
        let price = '250€';
        if (finalSelections.type === 'Mascota') {
          price = size === 'pequeno' ? '250€' : size === 'mediano' ? '380€' : '550€';
        } else if (finalSelections.type === 'Individual') {
          price = size === 'pequeno' ? '350€' : size === 'mediano' ? '480€' : '680€';
        } else {
          price = size === 'pequeno' ? '500€' : size === 'mediano' ? '750€' : '980€';
        }

        const mailSubject = encodeURIComponent(`Inquire: Retrato ${finalSelections.type} ${finalSelections.size}`);
        const mailBody = encodeURIComponent(`Hola Naroa,\n\nMe gustaría encargar un retrato de tipo ${finalSelections.type} en tamaño ${finalSelections.size}.\n\nSaludos.`);
        const mailUrl = `mailto:naroa@naroa.eu?subject=${mailSubject}&body=${mailBody}`;

        setMessages(prev => [
          ...prev,
          {
            sender: 'mica',
            text: `He preparado tu propuesta. Retrato ${finalSelections.type} (${finalSelections.size}) sobre pizarra natural. Estimación aproximada: desde ${price}. ¿Deseas enviar la solicitud directamente a Naroa para concretar detalles?`,
            options: [
              { label: '✉️ Enviar Solicitud por Email', action: `mail:${mailUrl}` },
              { label: '🔄 Empezar de nuevo', action: 'reset' }
            ]
          }
        ]);
      } else if (action === 'view_rates') {
        setMessages(prev => [
          ...prev,
          {
            sender: 'mica',
            text: 'Tarifas base aproximadas (Acrílico sobre Pizarra Natural):\n\n• Mascotas: desde 250€ (20x30 cm)\n• Retrato Individual: desde 450€ (30x40 cm)\n• Retrato Doble: desde 750€ (40x60 cm)\n\nCada obra incluye ganchos de alta resistencia y certificado de autenticidad.',
            options: [
              { label: '🎨 Encargar Retrato', action: 'custom_portrait' },
              { label: '🔄 Menú Principal', action: 'reset' }
            ]
          }
        ]);
      } else if (action === 'direct_contact') {
        setMessages(prev => [
          ...prev,
          {
            sender: 'mica',
            text: 'Puedes escribir directamente a Naroa a través de su correo oficial o ver su portafolio online:',
            options: [
              { label: '✉️ Email: naroa@naroa.eu', action: 'mail:mailto:naroa@naroa.eu' },
              { label: '🌐 Portafolio Online', action: 'link:https://naroa.online' },
              { label: '🔄 Menú Principal', action: 'reset' }
            ]
          }
        ]);
      } else if (action === 'reset') {
        setStage('init');
        setMessages(prev => [
          ...prev,
          {
            sender: 'mica',
            text: '¿En qué puedo ayudarte ahora?',
            options: [
              { label: '🎨 Retrato por Encargo', action: 'custom_portrait' },
              { label: '💰 Ver Tarifas', action: 'view_rates' },
              { label: '✉️ Contacto Directo', action: 'direct_contact' }
            ]
          }
        ]);
      } else if (action.startsWith('mail:')) {
        window.location.href = action.replace('mail:', '');
      } else if (action.startsWith('link:')) {
        window.open(action.replace('link:', ''), '_blank');
      }
    }, 400);
  };

  return (
    <>
      {/* Floating Sparkle Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-8 z-[250] flex items-center justify-center w-12 h-12 rounded-full border border-primary/40 bg-background/80 backdrop-blur shadow-[0_0_30px_rgba(43,59,229,0.2)] hover:scale-105 active:scale-95 transition-all duration-300 group"
      >
        <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping pointer-events-none opacity-50" />
        {/* Pulsing Light Point representing Mica */}
        <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(43,59,229,1)] group-hover:scale-125 transition-transform duration-300" />
        
        {/* Tiny labels */}
        <span className="absolute right-14 font-sans text-[8px] tracking-[0.3em] uppercase text-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-black/80 px-2 py-1 border border-primary/20 rounded-sm">
          Otra Naro
        </span>
      </button>

      {/* Tiny Chat Overlay */}
      {isOpen && (
        <div className="fixed bottom-40 right-8 z-[250] w-[320px] max-h-[420px] bg-[#0A0A0A]/95 backdrop-blur border border-primary/20 rounded-sm shadow-[0_10px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-[fadeIn_0.4s_ease-out]">
          
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-primary font-medium">Otra Naro</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  localStorage.removeItem('naroa_mica_messages');
                  localStorage.removeItem('naroa_mica_selections');
                  localStorage.removeItem('naroa_mica_stage');
                  setStage('init');
                  setSelections({ type: '', size: '' });
                  setMessages(defaultInitialMessage);
                }} 
                className="text-white/30 hover:text-primary transition-colors text-[9px] uppercase tracking-wider font-sans border-0 bg-transparent cursor-pointer"
                title="Limpiar Conversación"
              >
                Limpiar
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-foreground/40 hover:text-white text-xs bg-transparent border-0 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Logs */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 scrollbar-thin select-none max-h-[300px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div
                  className={`p-3 text-[10px] font-sans tracking-wide leading-relaxed rounded-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary/10 border border-primary/30 text-primary'
                      : 'bg-white/5 text-foreground/80'
                  }`}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Options Area */}
          <div className="p-4 border-t border-white/5 bg-black/20 flex flex-col gap-1.5 max-h-[140px] overflow-y-auto">
            {messages[messages.length - 1]?.options?.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleOptionClick(opt.action, opt.label)}
                className="w-full text-left p-2.5 border border-white/5 hover:border-primary/40 hover:text-primary transition-all duration-300 text-[9px] font-sans tracking-widest uppercase rounded-sm bg-black/40"
              >
                {opt.label}
              </button>
            ))}
          </div>

        </div>
      )}
    </>
  );
}
