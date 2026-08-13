import { useEffect, useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { ARTWORKS } from '../artworks'
import { sound } from '../utils/audio'

interface GalleryProps {
  onInspectArtwork: (index: number) => void
  isStarted: boolean
  setInteractionPrompt: (prompt: string | null) => void
  reducedMotion?: boolean
}

interface FrameFlipState {
  [key: number]: boolean
}

export function Gallery({ onInspectArtwork, isStarted, setInteractionPrompt }: GalleryProps) {
  const { camera, scene } = useThree()
  const artworks = useMemo(() => ARTWORKS, [])
  const textures = useTexture(artworks.map((a) => a.url))

  // Estado de volteo tridimensional por obra (Reverso Acústico)
  const [flippedStates, setFlippedStates] = useState<FrameFlipState>({})
  const frameGroupRefs = useRef<(THREE.Group | null)[]>([])
  const wallRefs = useRef<(THREE.Mesh | null)[]>([])

  const raycaster = useRef(new THREE.Raycaster())
  const center = useRef(new THREE.Vector2(0, 0))
  const targetedIndexRef = useRef<number | null>(null)

  // Generar textura procedimental para el "Reverso Acústico" de la Pizarra Vasca
  const reversoTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 680
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Pizarra vasca cruda
      ctx.fillStyle = '#0f0f18'
      ctx.fillRect(0, 0, 512, 680)

      // Grietas y relieve lítico
      for (let i = 0; i < 4500; i++) {
        const x = Math.random() * 512
        const y = Math.random() * 680
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
        ctx.fillRect(x, y, 2, 2)
      }

      // Manuscrito en la trasera Naroa & Aaron Spirit
      ctx.strokeStyle = '#FFD700'
      ctx.lineWidth = 2.5
      ctx.strokeRect(24, 24, 464, 632)

      ctx.fillStyle = '#FFD700'
      ctx.font = 'bold 22px monospace'
      ctx.fillText('REVERSO ACÚSTICO', 140, 75)

      ctx.font = '15px monospace'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.fillText('«Pizarra de Tejado Vasco de Bizkaia»', 90, 115)
      ctx.fillText('Soporte Lítico Recuperado · Resina & Mica', 70, 145)
      ctx.fillText('Audio: Borja Moskv — Soundscape QR', 85, 175)

      // Frase poética manuscrita
      ctx.fillStyle = '#FF1493'
      ctx.font = 'italic 16px sans-serif'
      ctx.fillText('«Retratos con alma, mimo y calma · Yo Pinto Mucho»', 60, 215)

      // Dibujo de QR / Cinta Acústica Retro POP
      ctx.strokeStyle = '#2B3BE5'
      ctx.lineWidth = 3
      ctx.strokeRect(186, 250, 140, 140)
      ctx.fillStyle = '#2B3BE5'
      ctx.fillRect(206, 270, 40, 40)
      ctx.fillRect(266, 330, 40, 40)

      ctx.font = '13px monospace'
      ctx.fillStyle = '#FFD700'
      ctx.fillText('[ REVOLUCIÓN SONORA RADIAL ]', 125, 430)
      ctx.fillText('Retrato Co-creativo — Alter Ego Aaron', 105, 460)
    }
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [])

  // Configurar niebla y ambiente
  useEffect(() => {
    scene.fog = new THREE.Fog('#030305', 4, 28)
    scene.background = new THREE.Color('#030305')
  }, [scene])

  // Transición suave de rotación 3D para el reverso
  useFrame((_, delta) => {
    artworks.forEach((_, i) => {
      const group = frameGroupRefs.current[i]
      if (group) {
        const isFlipped = flippedStates[i] || false
        const targetRotation = isFlipped ? Math.PI : 0
        group.rotation.y = THREE.MathUtils.damp(group.rotation.y, targetRotation, 10, delta)
      }
    })
  })

  // Raycasting de proximidad y mira central
  useFrame(() => {
    if (!isStarted) return

    raycaster.current.setFromCamera(center.current, camera)
    const intersects = raycaster.current.intersectObjects(scene.children, true)

    let foundIndex: number | null = null
    for (let i = 0; i < intersects.length; i++) {
      const obj = intersects[i].object
      if (obj.userData.isArtwork && intersects[i].distance < 4.5) {
        const idx = obj.userData.index as number
        foundIndex = idx
        targetedIndexRef.current = idx

        const isFlipped = flippedStates[idx] || false
        const actionText = isFlipped ? 'E: Modal · F: Voltear a Lienzo' : 'E: Inspeccionar · F: Reverso Acústico'
        setInteractionPrompt(`${obj.userData.title} [${actionText}]`)

        // Brillo directo
        const mesh = obj as THREE.Mesh
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.emissive.set('#FFD700')
          mesh.material.emissiveIntensity = 0.35
        }
        break
      }
    }

    if (foundIndex === null) {
      targetedIndexRef.current = null
      setInteractionPrompt(null)
      wallRefs.current.forEach((mesh) => {
        if (mesh && mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.emissive.set('#000000')
          mesh.material.emissiveIntensity = 0
        }
      })
    }
  })

  // Manejar hotkeys 'E' (Inspect) y 'F' (Flip Reverso Acústico)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStarted) return

      if (e.code === 'KeyE' && targetedIndexRef.current !== null) {
        onInspectArtwork(targetedIndexRef.current)
      } else if (e.code === 'KeyF' && targetedIndexRef.current !== null) {
        const idx = targetedIndexRef.current
        sound.playFrameFlip()
        setFlippedStates((prev) => ({
          ...prev,
          [idx]: !prev[idx],
        }))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isStarted, onInspectArtwork])

  return (
    <group>
      {/* Arco Secreto «El ReCreo — Arqueología Matérica & Latas Vintage» */}
      <group position={[0, 2.8, -14.9]}>
        <mesh position={[0, 0, 0]}>
          <ringGeometry args={[1.8, 2.1, 32]} />
          <meshStandardMaterial color="#FF1493" emissive="#FF1493" emissiveIntensity={0.6} />
        </mesh>
        <pointLight position={[0, 0, 0.5]} intensity={3.5} color="#FF1493" distance={6} />
      </group>

      {/* Paredes de la Galería en Basalto y Pizarra */}
      <mesh position={[0, 3, -15.1]} receiveShadow>
        <planeGeometry args={[32, 7]} />
        <meshStandardMaterial color="#0b0b0f" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3, 15.1]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[32, 7]} />
        <meshStandardMaterial color="#0b0b0f" roughness={0.8} />
      </mesh>
      <mesh position={[-15.1, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[32, 7]} />
        <meshStandardMaterial color="#0b0b0f" roughness={0.8} />
      </mesh>
      <mesh position={[15.1, 3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[32, 7]} />
        <meshStandardMaterial color="#0b0b0f" roughness={0.8} />
      </mesh>

      {/* Iluminación Dramática POP & Museística */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 18, 10]} intensity={1.5} castShadow />
      <spotLight position={[0, 7, 0]} angle={0.7} penumbra={0.8} intensity={3.0} color="#FFD700" castShadow />
      <pointLight position={[-10, 4, -10]} intensity={2.2} color="#FF1493" />
      <pointLight position={[10, 4, 10]} intensity={2.2} color="#2B3BE5" />

      {/* Distribución de Obras 3D en las Paredes de la Sala */}
      {artworks.map((art, i) => {
        const wallIndex = i % 4
        const itemsPerWall = Math.ceil(artworks.length / 4)
        const indexInWall = Math.floor(i / 4)
        const offset = (indexInWall - (itemsPerWall - 1) / 2) * 6.5

        let position: [number, number, number] = [0, 3, 0]
        let rotation: [number, number, number] = [0, 0, 0]

        switch (wallIndex) {
          case 0: // Pared Norte
            position = [offset, 3.2, -14.8]
            rotation = [0, 0, 0]
            break
          case 1: // Pared Este
            position = [14.8, 3.2, offset]
            rotation = [0, -Math.PI / 2, 0]
            break
          case 2: // Pared Sur
            position = [offset, 3.2, 14.8]
            rotation = [0, Math.PI, 0]
            break
          case 3: // Pared Oeste
            position = [-14.8, 3.2, offset]
            rotation = [0, Math.PI / 2, 0]
            break
        }

        const wallSpotColors = ['#FFD700', '#FF1493', '#8D97FF', '#FF9F1C']
        const spotColor = wallSpotColors[wallIndex]

        return (
          <group key={art.id} position={position} rotation={rotation}>
            {/* Foco de Luz Específico POP sobre cada Cuadro */}
            <spotLight
              position={[0, 2.5, 1.5]}
              target-position={[0, 0, 0]}
              angle={0.48}
              penumbra={0.6}
              intensity={2.8}
              color={spotColor}
              distance={7}
            />

            {/* Sub-grupo que rota 180° para el Reverso Acústico */}
            <group ref={(el) => (frameGroupRefs.current[i] = el)}>
              {/* Marco Esculpido de Pizarra & Madera de Deriva */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[3.4, 4.4, 0.12]} />
                <meshStandardMaterial color="#181820" roughness={0.3} metalness={0.8} />
              </mesh>

              {/* Borde Biselado Dorado POP / Kintsugi */}
              <mesh position={[0, 0, 0.065]}>
                <boxGeometry args={[3.45, 4.45, 0.01]} />
                <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
              </mesh>

              {/* Cara Frontal: Lienzo de la Obra (PBR con Resina & Clearcoat) */}
              <mesh
                ref={(el) => (wallRefs.current[i] = el)}
                position={[0, 0, 0.07]}
                userData={{ isArtwork: true, index: i, title: art.title }}
                onClick={() => {
                  if (!isStarted) {
                    onInspectArtwork(i)
                  } else {
                    sound.playFrameFlip()
                    setFlippedStates((prev) => ({ ...prev, [i]: !prev[i] }))
                  }
                }}
                onPointerOver={() => (document.body.style.cursor = 'pointer')}
                onPointerOut={() => (document.body.style.cursor = 'auto')}
              >
                <planeGeometry args={[3.2, 4.2]} />
                <meshPhysicalMaterial
                  map={textures[i]}
                  roughness={0.35}
                  metalness={0.15}
                  clearcoat={0.75}
                  clearcoatRoughness={0.12}
                  reflectivity={0.85}
                />
              </mesh>

              {/* Ojos de Cristal 3D (Pupilas Cerámicas Hiperrealistas en Relieve) */}
              <mesh position={[-0.45, 0.45, 0.08]}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshPhysicalMaterial color="#FFFFFF" clearcoat={1.0} clearcoatRoughness={0.0} roughness={0.1} emissive="#FFD700" emissiveIntensity={0.25} />
              </mesh>
              <mesh position={[0.45, 0.45, 0.08]}>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshPhysicalMaterial color="#FFFFFF" clearcoat={1.0} clearcoatRoughness={0.0} roughness={0.1} emissive="#FFD700" emissiveIntensity={0.25} />
              </mesh>

              {/* Cara Trasera: "El Reverso Acústico" (Rotada 180° en Z/Y) */}
              <mesh
                position={[0, 0, -0.07]}
                rotation={[0, Math.PI, 0]}
                userData={{ isArtwork: true, index: i, title: `${art.title} (Reverso Acústico)` }}
                onClick={() => {
                  sound.playFrameFlip()
                  setFlippedStates((prev) => ({ ...prev, [i]: !prev[i] }))
                }}
              >
                <planeGeometry args={[3.2, 4.2]} />
                <meshStandardMaterial map={reversoTexture} roughness={0.65} metalness={0.35} />
              </mesh>
            </group>

            {/* Placa Informativa de Bronce Iluminada debajo del Cuadro */}
            <mesh position={[0, -2.5, 0.08]}>
              <planeGeometry args={[2.2, 0.35]} />
              <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
