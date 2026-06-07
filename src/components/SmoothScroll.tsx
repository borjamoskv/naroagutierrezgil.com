'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.5,
      lerp: 0.04,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing cinemático
      smoothWheel: true,
      wheelMultiplier: 1.2,
      touchMultiplier: 1.8,
    })

    lenis.on('scroll', (e) => {
      // Normalizar velocidad y limitar el valor máximo para evitar saltos bruscos
      const velocity = Math.min(Math.abs(e.velocity) / 6, 2.5);
      document.documentElement.style.setProperty('--scroll-velocity', velocity.toString());
      document.documentElement.style.setProperty('--scroll-direction', e.direction.toString());
    });

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
