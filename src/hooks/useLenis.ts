"use client";
import { useEffect } from "react";
import Lenis from "lenis";

export default function useLenis(options?: {
  duration?: number;
  wheelMultiplier?: number;
  touchMultiplier?: number;
}) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: options?.duration ?? 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: options?.wheelMultiplier ?? 1,
      touchMultiplier: options?.touchMultiplier ?? 2,
    });

    let animationId: number;

    function raf(time: number) {
      lenis.raf(time);
      
      const velocity = lenis.velocity;
      const absVelocity = Math.abs(velocity);
      const direction = lenis.direction; // 1 for down, -1 for up, 0 for still
      
      if (typeof window !== 'undefined') {
        (window as any).__scrollVelocity = absVelocity;
        
        // Normalize velocity (scale 0 to 1 for visual transforms, e.g. mapping max 25px/frame)
        const normalizedVelocity = Math.min(absVelocity / 25.0, 1.0);
        document.documentElement.style.setProperty('--scroll-velocity', normalizedVelocity.toString());
        document.documentElement.style.setProperty('--scroll-direction', direction.toString());
      }
      
      animationId = requestAnimationFrame(raf);
    }
    animationId = requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [options?.duration, options?.wheelMultiplier, options?.touchMultiplier]);
}
