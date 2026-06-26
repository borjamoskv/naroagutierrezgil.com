'use client';

import { useEffect, useRef } from 'react';

/**
 * PROTOCOLO AARON (C5-REAL ENGINE)
 * Inyecta una mutación de identidad global en el DOM cuando el usuario teclea "AARON".
 * Invierte la estética de Pop Vibrante a Monocromo Industrial Noir.
 */
export default function AaronProtocol() {
  const sequence = useRef<string>('');
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el usuario está escribiendo en un input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toUpperCase();
      sequence.current += key;
      
      // Mantener solo los últimos 5 caracteres
      if (sequence.current.length > 5) {
        sequence.current = sequence.current.slice(-5);
      }

      if (sequence.current === 'AARON') {
        const root = document.documentElement;
        const isAaronActive = root.getAttribute('data-aaron') === 'true';

        if (!isAaronActive) {
          // Mutación a Industrial Noir
          root.setAttribute('data-aaron', 'true');
          root.style.setProperty('--primary', '#EAEAEA'); // Silver
          root.style.setProperty('--background', '#000000'); // Absolute Black
          root.style.setProperty('--foreground', '#71717A'); // Zinc 500 para máximo contraste Noir
          
          // Efecto de Glitch Visual Inmediato
          document.body.style.filter = 'invert(1) hue-rotate(180deg)';
          setTimeout(() => {
            document.body.style.filter = 'none';
          }, 150);
          
          console.log('[C5-REAL]: Protocolo Aaron Activado. Identidad Mutada.');
        } else {
          // Reversión al estado original
          root.setAttribute('data-aaron', 'false');
          root.style.removeProperty('--primary');
          root.style.removeProperty('--background');
          root.style.removeProperty('--foreground');
          
          // Efecto de Glitch Visual Inmediato
          document.body.style.filter = 'invert(1)';
          setTimeout(() => {
            document.body.style.filter = 'none';
          }, 150);
          
          console.log('[C5-REAL]: Protocolo Aaron Desactivado. Identidad Base Restaurada.');
        }
        
        // Reset sequence
        sequence.current = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
}
