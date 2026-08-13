import { useMemo } from 'react'
import * as THREE from 'three'
import { Grid } from '@react-three/drei'

export function EnvironmentLevel() {
  // Generar textura PBR de Pizarra Vasca Pulida con Vetas Kintsugi Doradas procedimentalmente
  const slateFloorTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Base Pizarra Oscura Bilbao
      ctx.fillStyle = '#0a0a0f'
      ctx.fillRect(0, 0, 512, 512)

      // Textura de grano lítico
      for (let i = 0; i < 8000; i++) {
        const x = Math.random() * 512
        const y = Math.random() * 512
        const val = Math.floor(Math.random() * 25)
        ctx.fillStyle = `rgba(${val}, ${val + 5}, ${val + 15}, 0.3)`
        ctx.fillRect(x, y, 2, 2)
      }

      // Vetas Kintsugi Accidental (Cantinflowers - ORO)
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(50, 0)
      ctx.lineTo(120, 200)
      ctx.lineTo(300, 320)
      ctx.lineTo(512, 480)

      ctx.moveTo(400, 0)
      ctx.lineTo(310, 180)
      ctx.lineTo(150, 400)
      ctx.stroke()
    }
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(8, 8)
    return texture
  }, [])

  return (
    <group>
      {/* Suelo PBR de Pizarra Vasca Reflectante */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshPhysicalMaterial
          map={slateFloorTexture}
          roughness={0.15}
          metalness={0.7}
          clearcoat={0.6}
          clearcoatRoughness={0.1}
          reflectivity={0.9}
        />
      </mesh>

      {/* Retícula Guía Cyberpunk sutil sobre la pizarra */}
      <Grid
        position={[0, 0.01, 0]}
        args={[60, 60]}
        cellSize={1.5}
        cellThickness={0.8}
        cellColor="#2B3BE5"
        sectionSize={6}
        sectionThickness={1.2}
        sectionColor="#D4AF37"
        fadeDistance={35}
        fadeStrength={1.2}
      />

      {/* Columnas de Pizarra y Bronce en las esquinas de la Galería */}
      {[-16, 16].map((x) =>
        [-16, 16].map((z) => (
          <group key={`col-${x}-${z}`} position={[x, 4, z]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.2, 8, 1.2]} />
              <meshStandardMaterial color="#121218" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Bisel de Bronce Dorado */}
            <mesh position={[0, 3.8, 0]}>
              <boxGeometry args={[1.4, 0.2, 1.4]} />
              <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))
      )}

      {/* Techo Oscuro de Galería con Focos Incrustados */}
      <mesh position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#050507" roughness={0.9} />
      </mesh>
    </group>
  )
}
