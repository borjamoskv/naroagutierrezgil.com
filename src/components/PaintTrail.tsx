'use client'
import { useEffect, useState } from 'react'

export default function PaintTrail() {
  const [dots, setDots] = useState<{id: number, x: number, y: number, size: number, rot: number}[]>([])

  useEffect(() => {
    let idCounter = 0;
    const handleMove = (e: MouseEvent) => {
      // Throttle for performance
      if (Math.random() > 0.4) return;
      
      const newDot = {
        id: idCounter++,
        x: e.clientX,
        y: e.clientY,
        size: Math.random() * 30 + 10,
        rot: Math.random() * 360
      };
      
      setDots(prev => [...prev.slice(-40), newDot]);
      
      setTimeout(() => {
        setDots(prev => prev.filter(d => d.id !== newDot.id))
      }, 1500)
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[120] overflow-hidden">
      {dots.map(dot => (
        <div 
          key={dot.id}
          className="absolute rounded-full bg-primary/40 mix-blend-screen blur-[3px]"
          style={{
            left: dot.x - dot.size / 2,
            top: dot.y - dot.size / 2,
            width: dot.size,
            height: dot.size,
            transform: `rotate(${dot.rot}deg) scaleY(2.5)`,
            animation: 'fadeTrail 1.5s cubic-bezier(0.1, 0.9, 0.2, 1) forwards'
          }}
        />
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeTrail {
          0% { opacity: 0.9; transform: scale(1); }
          100% { opacity: 0; transform: scale(4); }
        }
      `}} />
    </div>
  )
}
