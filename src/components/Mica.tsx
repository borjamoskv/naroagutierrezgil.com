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
    text: 'Hola. Este es un espacio dedicado al arte de Naroa Gutiérrez Gil. ¿Te gustaría ser retratado/a por ella o encargar una obra en pizarra natural?',
    options: [
      { label: '🎨 Ser Retratado por Naroa', action: 'custom_portrait' },
      { label: '💰 Ver Tarifas', action: 'view_rates' },
      { label: '✉️ Contactar con Naroa', action: 'direct_contact' }
    ]
  }
];

const generateMicaResponse = (input: string): { text: string; options?: { label: string; action: string }[] } => {
  const query = input.toLowerCase().trim();
  
  if (query.includes('precio') || query.includes('tarifa') || query.includes('cuanto') || query.includes('cuesta') || query.includes('valen') || query.includes('€') || query.includes('cost')) {
    return {
      text: 'El arte de Naroa se plasma en pizarra natural recuperada. Las tarifas orientativas son:\n\n• Mascotas: desde 250€ (20x30 cm)\n• Retrato Individual: desde 450€ (30x40 cm)\n• Retrato Doble: desde 750€ (40x60 cm)\n\n¿Te gustaría definir una propuesta para ser retratado/a por Naroa?',
      options: [
        { label: '🎨 Definir Retrato', action: 'custom_portrait' },
        { label: '✉️ Contactar con Naroa', action: 'route:/contacto' }
      ]
    };
  }
  
  if (query.includes('encargo') || query.includes('personalizado') || query.includes('retrato') || query.includes('pedir') || query.includes('pintar') || query.includes('foto')) {
    return {
      text: 'Naroa realiza retratos personalizados (personas, mascotas o composiciones conjuntas) pintados a mano sobre pizarra o poliéster. ¿Quieres configurar los detalles de tu obra?',
      options: [
        { label: '🎨 Configurar Retrato', action: 'custom_portrait' },
        { label: '🔄 Volver al Inicio', action: 'reset' }
      ]
    };
  }

  if (query.includes('tiempo') || query.includes('tarda') || query.includes('plazo') || query.includes('dias') || query.includes('fecha') || query.includes('tardas')) {
    return {
      text: 'Cada retrato es único y requiere un proceso minucioso de pintura y secado. El plazo estimado de entrega suele ser de 2 a 4 semanas desde el taller en Bilbao.',
      options: [
        { label: '✉️ Contacto directo', action: 'route:/contacto' },
        { label: '🔄 Volver al Inicio', action: 'reset' }
      ]
    };
  }

  if (query.includes('envio') || query.includes('mandar') || query.includes('correo') || query.includes('direccion') || query.includes('bilbao') || query.includes('enviar')) {
    return {
      text: 'Nuestras obras se envían desde Bilbao en embalajes de madera de alta protección para garantizar su perfecta recepción en cualquier destino.',
      options: [
        { label: '✉️ Formulario de Contacto', action: 'route:/contacto' },
        { label: '🔄 Volver al Inicio', action: 'reset' }
      ]
    };
  }

  if (query.includes('hola') || query.includes('buenas') || query.includes('saludos') || query.includes('hello')) {
    return {
      text: 'Hola. Este es un espacio dedicado a las obras y retratos de Naroa Gutiérrez Gil. ¿Cómo te gustaría proceder?',
      options: [
        { label: '🎨 Ser Retratado por Naroa', action: 'custom_portrait' },
        { label: '💰 Ver Tarifas', action: 'view_rates' },
        { label: '🔄 Volver al Inicio', action: 'reset' }
      ]
    };
  }

  const fallbacks = [
    'Naroa trabaja con pizarras de tejado recuperadas, resina, acrílicos y mica mineral. ¿Te gustaría encargar un retrato personalizado?',
    'El propósito de este taller es dar forma a tus miradas y recuerdos. ¿Quieres ver las tarifas o configurar tu retrato por Naroa?',
    'Puedes encargar un retrato individual, de pareja o de tu mascota. ¿Deseas ver las opciones disponibles?'
  ];
  const text = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  
  return {
    text,
    options: [
      { label: '🎨 Configurar Retrato', action: 'custom_portrait' },
      { label: '💰 Ver Tarifas', action: 'view_rates' },
      { label: '🔄 Volver al Inicio', action: 'reset' }
    ]
  };
};

export default function Mica() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stage, setStage] = useState<'init' | 'type' | 'size' | 'summary'>('init');
  const [selections, setSelections] = useState({ type: '', size: '' });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem('naroa_mica_messages');
    const savedStage = localStorage.getItem('naroa_mica_stage');
    const savedSelections = localStorage.getItem('naroa_mica_selections');

    setTimeout(() => {
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch {
          setMessages(defaultInitialMessage);
        }
      } else {
        setMessages(defaultInitialMessage);
      }

      if (savedStage) {
        setStage(savedStage as 'init' | 'type' | 'size' | 'summary');
      }

      if (savedSelections) {
        try {
          setSelections(JSON.parse(savedSelections));
        } catch {
          // ignore
        }
      }
    }, 0);
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
  }, [messages, isOpen, isTyping]);

  const handleOptionClick = (action: string, label: string) => {
    setMessages(prev => [...prev, { sender: 'user', text: label }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      if (action === 'custom_portrait') {
        setStage('type');
        setMessages(prev => [
          ...prev,
          {
            sender: 'mica',
            text: 'Entendido. Un retrato en pizarra es una forma duradera de plasmar una imagen. ¿Qué tipo de retrato prefieres?',
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
            text: `De acuerdo, un retrato de tipo ${typeLabel}. ¿En qué formato y tamaño de pizarra te gustaría plasmarlo?`,
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
            text: `He preparado la propuesta: Retrato ${finalSelections.type} (${finalSelections.size}) sobre pizarra natural. Estimación aproximada: desde ${price}. ¿Deseas enviar los detalles a Naroa por correo para concretar el encargo?`,
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
              { label: '✉️ Formulario de Contacto', action: 'route:/contacto' },
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
              { label: '🎨 Ser Retratado por Naroa', action: 'custom_portrait' },
              { label: '💰 Ver Tarifas', action: 'view_rates' },
              { label: '✉️ Contactar con Naroa', action: 'direct_contact' }
            ]
          }
        ]);
      } else if (action.startsWith('mail:')) {
        window.location.href = action.replace('mail:', '');
      } else if (action.startsWith('link:')) {
        window.open(action.replace('link:', ''), '_blank');
      } else if (action.startsWith('route:')) {
        window.location.href = action.replace('route:', '');
      }
    }, 800);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const newHistory = [...messages, { sender: 'user', text: userText } as Message];
    setMessages(newHistory);
    setInputValue('');
    setIsTyping(true);

    // Call Cloudflare Workers AI Edge Function
    try {
      const res = await fetch('/api/cortex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history: messages.slice(-4) })
      });
      
      if (res.ok) {
        const data = await res.json() as { response: string };
        setMessages(prev => [...prev, { sender: 'mica', text: data.response }]);
      } else {
        // Fallback to local logic if AI is offline
        const botResponse = generateMicaResponse(userText);
        setMessages(prev => [...prev, { sender: 'mica', text: botResponse.text, options: botResponse.options }]);
      }
    } catch (err) {
      const botResponse = generateMicaResponse(userText);
      setMessages(prev => [...prev, { sender: 'mica', text: botResponse.text, options: botResponse.options }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Sparkle Toggle Button (Miniaturizado y discreto) */}
      <button
        aria-label="Alternar Asistente Mica"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[250] flex items-center justify-center w-8 h-8 rounded-full border border-primary/20 bg-black/60 backdrop-blur-md shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-primary/70 group-hover:bg-primary transition-colors duration-300" />
        
        <span className="absolute right-10 font-sans text-[7px] tracking-[0.2em] uppercase text-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap bg-black/80 px-2 py-1 rounded-sm">
          Mica
        </span>
      </button>

      {/* Tiny Chat Overlay (Discreto) */}
      {isOpen && (
        <div className="fixed bottom-16 right-6 z-[250] w-[280px] max-h-[400px] bg-neutral-950/95 backdrop-blur-md border border-white/5 rounded-md shadow-2xl flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out]">
          
          {/* Header */}
          <div className="p-3 border-b border-white/5 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse opacity-70" />
              <span className="font-sans text-[8px] tracking-[0.2em] uppercase text-white/70 font-medium">Mica (Taller)</span>
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
                className="text-white/30 hover:text-white transition-colors text-[8px] uppercase tracking-wider font-sans border-0 bg-transparent cursor-pointer"
                title="Limpiar Conversación"
              >
                Reset
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white text-[10px] bg-transparent border-0 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Logs */}
          <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2 scrollbar-thin select-none max-h-[220px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col max-w-[90%] ${
                  msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div
                  className={`p-2.5 text-[9px] font-sans tracking-wide leading-relaxed rounded-md ${
                    msg.sender === 'user'
                      ? 'bg-primary/20 text-white border border-primary/20'
                      : 'bg-white/5 text-white/80'
                  }`}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="self-start flex flex-col max-w-[85%] items-start">
                <div className="p-2.5 bg-white/5 text-white/50 rounded-md flex gap-1 items-center">
                  <span className="w-1 h-1 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick Options Area */}
          {messages[messages.length - 1]?.options && (
            <div className="p-2 border-t border-white/5 bg-black/20 flex flex-col gap-1 max-h-[100px] overflow-y-auto">
              {messages[messages.length - 1].options?.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleOptionClick(opt.action, opt.label)}
                  className="w-full text-left p-2 hover:bg-white/5 transition-all duration-300 text-[8px] font-sans tracking-widest uppercase rounded-sm text-white/70 hover:text-white cursor-pointer"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Text Input Area */}
          <form 
            onSubmit={handleSendMessage}
            className="p-2 border-t border-white/5 bg-black flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe algo..."
              className="flex-1 bg-transparent border-0 focus:outline-none px-2 py-1 text-[9px] font-sans text-white placeholder-white/30 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="px-2 text-[var(--primary)] disabled:text-white/20 transition-colors font-sans text-[9px] tracking-widest uppercase cursor-pointer bg-transparent border-0"
            >
              Enviar
            </button>
          </form>

        </div>
      )}
    </>
  );
}
