'use client'
import { useEffect, useRef, useState } from 'react'

const ARTWORKS = [
  '/assets/james.webp',
  '/assets/amy.webp',
  '/assets/lagrimas.webp'
]

export default function ExcavationGame() {
  const [isActive, setIsActive] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentArt, setCurrentArt] = useState(ARTWORKS[0])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isActive || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Resize
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      
      // Fill with slate material
      ctx.fillStyle = '#0a0a0c' // Dark slate
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Add noise texture
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < imgData.data.length; i += 4) {
        const noise = Math.random() * 15
        imgData.data[i] += noise
        imgData.data[i+1] += noise
        imgData.data[i+2] += noise
      }
      ctx.putImageData(imgData, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    let isDrawing = false
    let totalPixels = canvas.width * canvas.height
    let erasedPixels = 0

    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = 'destination-out'
      
      // Chisel brush
      ctx.beginPath()
      ctx.arc(x, y, 60, 0, Math.PI * 2)
      ctx.fill()
      
      // Add rough edges
      for(let i=0; i<5; i++) {
        ctx.beginPath()
        ctx.arc(x + (Math.random()-0.5)*40, y + (Math.random()-0.5)*40, Math.random()*30, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // Simple progress calculation based on mouse movement
      erasedPixels += 5000 // approximation
      const p = Math.min((erasedPixels / totalPixels) * 100, 100)
      setProgress(p)
      
      // Splatter particles simulation (visual only)
      createDebris(x, y)
    }

    const createDebris = (x: number, y: number) => {
      const debris = document.createElement('div')
      debris.className = 'absolute bg-foreground/50 rounded-sm pointer-events-none'
      debris.style.left = x + 'px'
      debris.style.top = y + 'px'
      debris.style.width = Math.random() * 4 + 1 + 'px'
      debris.style.height = Math.random() * 4 + 1 + 'px'
      debris.style.transition = 'all 1s cubic-bezier(0.1, 0.9, 0.2, 1)'
      
      document.getElementById('debris-container')?.appendChild(debris)
      
      requestAnimationFrame(() => {
        debris.style.transform = `translate(${(Math.random() - 0.5) * 200}px, ${window.innerHeight}px) rotate(${Math.random() * 360}deg)`
        debris.style.opacity = '0'
      })
      
      setTimeout(() => debris.remove(), 1000)
    }

    const onDown = (e: MouseEvent | TouchEvent) => {
      isDrawing = true
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      scratch(clientX, clientY)
    }
    
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      scratch(clientX, clientY)
    }

    const onUp = () => isDrawing = false

    canvas.addEventListener('mousedown', onDown)
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseup', onUp)
    canvas.addEventListener('touchstart', onDown)
    canvas.addEventListener('touchmove', onMove)
    canvas.addEventListener('touchend', onUp)

    return () => {
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousedown', onDown)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseup', onUp)
      canvas.removeEventListener('touchstart', onDown)
      canvas.removeEventListener('touchmove', onMove)
      canvas.removeEventListener('touchend', onUp)
    }
  }, [isActive, currentArt])

  if (!isActive) {
    return (
      <div className="flex justify-center my-32 relative z-50">
        <button 
          onClick={() => setIsActive(true)}
          className="group relative px-8 py-4 border border-foreground/20 hover:border-primary transition-colors duration-700 overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-700 ease-out" />
          <span className="relative z-10 font-sans tracking-[0.4em] text-[10px] uppercase text-foreground group-hover:text-primary transition-colors duration-700">
            [ Iniciar Excavación ]
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[999] bg-background overflow-hidden cursor-crosshair">
      {/* Background Revealed Art */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{ backgroundImage: `url(${currentArt})` }}
      />
      
      {/* Physics Debris Container */}
      <div id="debris-container" className="absolute inset-0 pointer-events-none z-20" />
      
      {/* Scratch Layer */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 z-10 w-full h-full touch-none"
      />

      {/* HUD */}
      <div className="absolute top-8 left-8 z-30 mix-blend-difference text-primary/80 pointer-events-none flex flex-col gap-2">
        <span className="font-sans uppercase tracking-[0.4em] text-[10px]">Cincel Magnético</span>
        <span className="font-mono text-xs">{progress.toFixed(1)}% Revelado</span>
      </div>

      <button 
        onClick={() => setIsActive(false)}
        className="absolute top-8 right-8 z-30 font-sans uppercase tracking-[0.4em] text-[10px] text-foreground/50 hover:text-white mix-blend-difference"
      >
        Abortar
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-4">
        {ARTWORKS.map((art, i) => (
          <button 
            key={i}
            onClick={() => {
              setCurrentArt(art)
              setProgress(0)
              setIsActive(false)
              setTimeout(() => setIsActive(true), 100)
            }}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${currentArt === art ? 'bg-primary scale-150' : 'bg-white/20 hover:bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  )
}
