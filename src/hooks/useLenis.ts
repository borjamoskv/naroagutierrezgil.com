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

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, [options?.duration, options?.wheelMultiplier, options?.touchMultiplier]);
}
