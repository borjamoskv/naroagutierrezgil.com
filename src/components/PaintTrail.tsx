'use client'
import { useEffect, useRef } from 'react'

export default function PaintTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let width = window.innerWidth
    let height = window.innerHeight
    canvas.width = width
    canvas.height = height

    const particles: { x: number, y: number, vx: number, vy: number, life: number, maxLife: number, size: number }[] = []
    const mouse = { x: -1000, y: -1000, vx: 0, vy: 0 }
    const lastMouse = { x: -1000, y: -1000 }

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    
    const handleMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.vx = mouse.x - lastMouse.x
      mouse.vy = mouse.y - lastMouse.y
      lastMouse.x = mouse.x
      lastMouse.y = mouse.y

      // Spawn thermodynamic particles (condensation/dust/heat)
      const speed = Math.sqrt(mouse.vx ** 2 + mouse.vy ** 2)
      const spawnCount = Math.min(Math.floor(speed * 0.4), 12)
      
      for (let i = 0; i < spawnCount; i++) {
        particles.push({
          x: mouse.x + (Math.random() - 0.5) * 15,
          y: mouse.y + (Math.random() - 0.5) * 15,
          vx: mouse.vx * 0.15 + (Math.random() - 0.5) * 3,
          vy: mouse.vy * 0.15 + (Math.random() - 0.5) * 3,
          life: 1.0,
          maxLife: Math.random() * 0.6 + 0.4,
          size: Math.random() * 5 + 1.5
        })
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMove)

    let animationFrame: number
    const render = () => {
      // Fade canvas slightly for motion blur / heat dissipation
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'
      ctx.fillRect(0, 0, width, height)
      
      ctx.globalCompositeOperation = 'lighter'
      
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.92 // Slate Friction
        p.vy *= 0.92
        p.life -= 0.015 / p.maxLife
        
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }

        // Parse dynamic primary color for the Cold state
        let coldR = 43, coldG = 59, coldB = 229;
        const primaryColorStr = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
        if (primaryColorStr && primaryColorStr.startsWith('#')) {
          const r = parseInt(primaryColorStr.slice(1, 3), 16);
          const g = parseInt(primaryColorStr.slice(3, 5), 16);
          const b = parseInt(primaryColorStr.slice(5, 7), 16);
          if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
            coldR = r;
            coldG = g;
            coldB = b;
          }
        }

        // Thermodynamic color transition: Hot (White/Gold) -> Cold (Dynamic --primary)
        const heat = Math.max(p.life, 0)
        const r = Math.floor(255 * heat + coldR * (1 - heat))
        const g = Math.floor(168 * heat + coldG * (1 - heat))
        const b = Math.floor(124 * heat + coldB * (1 - heat)) 
        
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * heat, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${heat * 0.9})`
        ctx.fill()
      }

      // Draw dynamic liquid paint brush tip at cursor position
      if (mouse.x > -500 && mouse.y > -500) {
        // Parse dynamic primary color for the cursor tip
        let tipR = 43, tipG = 59, tipB = 229;
        const primaryColorStr = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
        if (primaryColorStr && primaryColorStr.startsWith('#')) {
          const r = parseInt(primaryColorStr.slice(1, 3), 16);
          const g = parseInt(primaryColorStr.slice(3, 5), 16);
          const b = parseInt(primaryColorStr.slice(5, 7), 16);
          if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
            tipR = r;
            tipG = g;
            tipB = b;
          }
        }

        const speed = Math.sqrt(mouse.vx ** 2 + mouse.vy ** 2);
        const radius = Math.max(10 - speed * 0.15, 5); // shrinks slightly as it stretches

        // Detect if hovering over clickable elements
        let isHoveringClickable = false;
        try {
          const target = document.elementFromPoint(mouse.x, mouse.y);
          if (target) {
            isHoveringClickable = !!(
              target.closest('a') || 
              target.closest('button') || 
              target.closest('.cursor-pointer') ||
              target.closest('#galeria .group')
            );
          }
        } catch (e) {}

        if (isHoveringClickable) {
          // Hollow ring transition on hover
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, radius * 1.8, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${tipR}, ${tipG}, ${tipB}, 0.95)`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          // Dynamic droplet stretching on speed
          ctx.beginPath();
          if (speed > 1) {
            const angle = Math.atan2(mouse.vy, mouse.vx);
            ctx.ellipse(mouse.x, mouse.y, radius + speed * 0.25, radius, angle, 0, Math.PI * 2);
          } else {
            ctx.arc(mouse.x, mouse.y, radius, 0, Math.PI * 2);
          }
          ctx.fillStyle = `rgba(${tipR}, ${tipG}, ${tipB}, 0.8)`;
          ctx.fill();
        }
      }
      
      animationFrame = requestAnimationFrame(render)
    }
    
    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMove)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[120]"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
