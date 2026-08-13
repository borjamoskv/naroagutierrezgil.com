import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface MicaParticlesProps {
  count?: number
}

export function MicaParticles({ count = 150 }: MicaParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const sp = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Distribuir partículas horizontalmente [-20, 20] y verticalmente [0.5, 6]
      pos[i * 3] = (Math.random() - 0.5) * 36
      pos[i * 3 + 1] = Math.random() * 5.5 + 0.5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 36

      sp[i] = Math.random() * 0.4 + 0.1
    }

    return [pos, sp]
  }, [count])

  // Material de destello dorado / mica
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
      gradient.addColorStop(0, 'rgba(255, 230, 160, 1)')
      gradient.addColorStop(0.4, 'rgba(212, 175, 55, 0.8)')
      gradient.addColorStop(1, 'rgba(43, 59, 229, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 32, 32)
    }
    return new THREE.CanvasTexture(canvas)
  }, [])

  useFrame((state, delta) => {
    if (!pointsRef.current) return
    const geometry = pointsRef.current.geometry
    const posAttr = geometry.attributes.position as THREE.BufferAttribute
    const array = posAttr.array as Float32Array

    const time = state.clock.getElapsedTime()

    for (let i = 0; i < count; i++) {
      // Movimiento ascendente suave con oscilación horizontal (vuelo de mica)
      array[i * 3 + 1] += speeds[i] * delta * 0.3
      array[i * 3] += Math.sin(time * 0.8 + i) * 0.005
      array[i * 3 + 2] += Math.cos(time * 0.6 + i) * 0.005

      // Si sobrepasa la altura del techo, reiniciar abajo
      if (array[i * 3 + 1] > 6.5) {
        array[i * 3 + 1] = 0.5
        array[i * 3] = (Math.random() - 0.5) * 36
        array[i * 3 + 2] = (Math.random() - 0.5) * 36
      }
    }

    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.18}
        map={particleTexture}
        transparent={true}
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
