// SYS_ID: BORJA_PROTOCOL_OMEGA
// STATE: C5-REAL
// AESTHETIC: INDUSTRIAL_NOIR_2026
// CREATOR: borjamoskv

'use client';

import { useEffect, useRef } from 'react';

/**
 * PROTOCOLO BORJA (C5-REAL ENGINE)
 * Inyecta una mutación de identidad global en el DOM cuando el usuario teclea "BORJA".
 * Invierte la estética de Pop Vibrante a Monocromo Industrial Noir.
 * 
 * Autoría y Dirección de Arte: Borja Moskv (borjamoskv) / MOSKV-1 APEX
 */
export default function BorjaProtocol() {
  const sequence = useRef<string>('');
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el usuario está escribiendo en un input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toUpperCase();
      sequence.current += key;
      
      // Mantener solo los últimos 5 caracteres ("BORJA" = 5 chars)
      if (sequence.current.length > 5) {
        sequence.current = sequence.current.slice(-5);
      }

      if (sequence.current === 'BORJA') {
        const root = document.documentElement;
        const isBorjaActive = root.getAttribute('data-borja') === 'true';

        if (!isBorjaActive) {
          // Mutación a Industrial Noir
          root.setAttribute('data-borja', 'true');
          root.style.setProperty('--primary', '#EAEAEA'); // Silver
          root.style.setProperty('--background', '#000000'); // Absolute Black
          root.style.setProperty('--foreground', '#71717A'); // Zinc 500 para máximo contraste Noir
          
          // Efecto de Glitch Visual Inmediato
          document.body.style.filter = 'invert(1) hue-rotate(180deg)';
          setTimeout(() => {
            document.body.style.filter = 'none';
          }, 150);
          
          console.log('[C5-REAL]: Protocolo Borja Activado. Identidad Mutada por el Demiurgo Borja Moskv.');
        } else {
          // Reversión al estado original
          root.setAttribute('data-borja', 'false');
          root.style.removeProperty('--primary');
          root.style.removeProperty('--background');
          root.style.removeProperty('--foreground');
          
          // Efecto de Glitch Visual Inmediato
          document.body.style.filter = 'invert(1)';
          setTimeout(() => {
            document.body.style.filter = 'none';
          }, 150);
          
          console.log('[C5-REAL]: Protocolo Borja Desactivado. Identidad Base Restaurada.');
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
