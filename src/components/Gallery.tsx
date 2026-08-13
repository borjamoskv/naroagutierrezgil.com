<<<<<<< HEAD
import { useEffect, useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
=======
>>>>>>> 62bbc4c3a127513cf434ac2303bb49841caf3450
import * as THREE from 'three'
import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Image, Sparkles, useTexture, Html } from '@react-three/drei'
import { easing } from 'maath'
import { ARTWORKS } from '../artworks'
import { sound } from '../utils/audio'
<<<<<<< HEAD

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
      ctx.fillStyle = '#0f0f15'
      ctx.fillRect(0, 0, 512, 680)

      // Grietas y relieve lítico
      for (let i = 0; i < 4000; i++) {
        const x = Math.random() * 512
        const y = Math.random() * 680
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
        ctx.fillRect(x, y, 2, 2)
      }

      // Manuscrito en la traseras
      ctx.strokeStyle = '#D4AF37'
      ctx.lineWidth = 2
      ctx.strokeRect(30, 30, 452, 620)

      ctx.fillStyle = '#D4AF37'
      ctx.font = '22px monospace'
      ctx.fillText('REVERSO ACÚSTICO', 140, 80)

      ctx.font = '14px monospace'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
      ctx.fillText('«Pizarra de Tejado Vasco de Bizkaia»', 100, 120)
      ctx.fillText('Soporte Lítico Recuperado · Resina & Mica', 80, 150)
      ctx.fillText('Audio: Borja Moskv — Soundscape QR', 90, 180)

      // Dibujo de QR / Cinta Acústica Retro
      ctx.strokeStyle = '#2B3BE5'
      ctx.lineWidth = 3
      ctx.strokeRect(186, 240, 140, 140)
      ctx.fillStyle = '#2B3BE5'
      ctx.fillRect(206, 260, 40, 40)
      ctx.fillRect(266, 320, 40, 40)

      ctx.font = '12px monospace'
      ctx.fillStyle = '#D4AF37'
      ctx.fillText('[ REVOLUCIÓN SONORA RADIAL ]', 130, 430)
      ctx.fillText('Retrato Co-creativo — Alter Ego Aaron', 110, 460)
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
        const idx = obj.userData.index as number
        foundIndex = idx
        targetedIndexRef.current = idx

        const isFlipped = flippedStates[idx] || false
        const actionText = isFlipped ? 'E: Modal · F: Voltear a Lienzo' : 'E: Inspeccionar · F: Reverso Acústico'
        setInteractionPrompt(`${obj.userData.title} [${actionText}]`)

        // Brillo directo
        const mesh = obj as THREE.Mesh
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.emissive.set('#2B3BE5')
          mesh.material.emissiveIntensity = 0.3
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
=======
import { TextureErrorBoundary } from './TextureErrorBoundary'

// Marco de cortesía cuando la textura de una obra no está disponible
function FallbackFrame({
  position,
  rotation,
  scale,
  title
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  title: string
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.04]} scale={[scale[0] + 0.16, scale[1] + 0.16, 0.04]}>
        <boxGeometry />
        <meshStandardMaterial color="#14151c" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh scale={[scale[0], scale[1], 0.02]}>
        <boxGeometry />
        <meshStandardMaterial color="#0A0A0A" metalness={0.4} roughness={0.6} />
      </mesh>
      <Html position={[0, 0, 0.06]} center distanceFactor={8}>
        <div
          style={{
            padding: '6px 14px',
            border: '1px solid rgba(43, 59, 229, 0.6)',
            borderRadius: '10px',
            background: 'rgba(10, 10, 10, 0.85)',
            color: '#8D97FF',
            fontSize: '11px',
            fontWeight: 700,
            fontFamily: 'monospace',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}
        >
          {title}
        </div>
      </Html>
    </group>
  )
}

if (typeof window !== 'undefined') {
  ARTWORKS.forEach((a) => {
    try {
      useTexture.preload(a.url)
    } catch {
      // Ignore preloader fail
    }
  })
}

interface GalleryItemProps {
  position: [number, number, number]
  rotation: [number, number, number]
  url: string
  scale: [number, number, number]
  index: number
  reducedMotion: boolean
  isSelected: boolean
  splatUrl?: string
}

function GalleryItem({
  position,
  scale,
  url,
  index,
  rotation,
  reducedMotion,
  isSelected,
  splatUrl
}: GalleryItemProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (meshRef.current && groupRef.current) {
      const floatY = reducedMotion
        ? position[1]
        : position[1] + Math.sin(state.clock.elapsedTime * 1.5 + index * 0.8) * 0.09

      groupRef.current.position.y = floatY

      const targetScale: [number, number, number] = isSelected
        ? [scale[0] * 1.05, scale[1] * 1.05, 1]
        : scale

      easing.damp3(meshRef.current.scale, targetScale, 0.2, delta)
      const material = meshRef.current.material as any
      easing.damp(material, 'grayscale', isSelected ? 0 : 0.4, 0.2, delta)
      easing.dampC(
        material.color,
        isSelected ? '#ffffff' : '#aaaaaa',
        0.2,
        delta
      )
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={rotation} userData={{ isArtwork: true, index }}>
      {splatUrl && (
        <Html position={[0, scale[1] / 2 + 0.35, 0.1]} center distanceFactor={8}>
          <div
            style={{
              padding: '3px 10px',
              background: 'linear-gradient(135deg, rgba(212,175,55,0.9) 0%, rgba(43,59,229,0.9) 100%)',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 900,
              fontFamily: 'monospace',
              letterSpacing: '1px',
              borderRadius: '12px',
              border: '1px solid #D4AF37',
              boxShadow: '0 0 12px rgba(212, 175, 55, 0.6)',
              pointerEvents: 'none', // Desactivado para no interferir con FPS
            }}
          >
            ✨ 3DGS 360°
          </div>
        </Html>
      )}

      <mesh position={[0, 0, -0.08]} scale={[scale[0] + 0.35, scale[1] + 0.35, 0.06]}>
        <boxGeometry />
        <meshStandardMaterial
          color={isSelected ? '#D4AF37' : '#1c1b18'}
          metalness={0.9}
          roughness={0.25}
          emissive={isSelected ? '#D4AF37' : '#000000'}
          emissiveIntensity={isSelected ? 0.5 : 0}
        />
      </mesh>

      <mesh position={[0, 0, -0.04]} scale={[scale[0] + 0.16, scale[1] + 0.16, 0.04]}>
        <boxGeometry />
        <meshPhysicalMaterial
          color={isSelected ? '#2B3BE5' : '#0a0a0d'}
          emissive={isSelected ? '#2B3BE5' : '#000000'}
          emissiveIntensity={isSelected ? 0.7 : 0}
          roughness={0.15}
          metalness={0.85}
          clearcoat={0.8}
          transmission={0.25}
          transparent
          opacity={isSelected ? 0.85 : 0.6}
        />
      </mesh>

      {isSelected && (
        <pointLight
          position={[0, scale[1] * 0.6, 0.8]}
          intensity={4.5}
          distance={6}
          color="#D4AF37"
        />
      )}

      <Image
        ref={meshRef}
        url={url}
        transparent
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </group>
  )
}

interface GalleryProps {
  onInspectArtwork: (index: number) => void
  reducedMotion: boolean
  setInteractionPrompt: (prompt: string | null) => void
  isStarted: boolean
}

export function Gallery({
  onInspectArtwork,
  reducedMotion,
  setInteractionPrompt,
  isStarted
}: GalleryProps) {
  const group = useRef<THREE.Group>(null)
  const { camera, scene } = useThree()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  
  const numItems = ARTWORKS.length
  const radius = 10 // Radio más grande para poder caminar dentro
  
  const items = useMemo(() => {
    return ARTWORKS.map((artwork, i) => {
      const angle = (i / numItems) * Math.PI * 2
      return {
        // Elevamos las obras para que estén a la altura de los ojos (1.7)
        position: [Math.sin(angle) * radius, 1.7, Math.cos(angle) * radius] as [number, number, number],
        rotation: [0, angle + Math.PI, 0] as [number, number, number], // Mirando hacia adentro del círculo
        url: artwork.url,
        title: artwork.title,
        href: artwork.href,
        splatUrl: artwork.splatUrl,
        scale: [3.1, 4.1, 1] as [number, number, number],
      }
    })
  }, [numItems, radius])

  // Raycaster logic for FPS interaction
  useEffect(() => {
    if (!isStarted) return;
    
    const raycaster = new THREE.Raycaster()
    const center = new THREE.Vector2(0, 0)
    
    let currentHoveredIndex: number | null = null

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && currentHoveredIndex !== null) {
        sound.playOpen()
        onInspectArtwork(currentHoveredIndex)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)

    // Poll raycaster every frame would be heavy, but we can do it in a fast interval or useFrame
    const interval = setInterval(() => {
      raycaster.setFromCamera(center, camera)
      // Buscar intersecciones solo en los grupos de obras
      const intersects = raycaster.intersectObjects(scene.children, true)
      
      let foundIndex: number | null = null
      
      for (let i = 0; i < intersects.length; i++) {
        const obj = intersects[i].object
        // Subir en la jerarquía hasta encontrar userData.isArtwork
        let parent: THREE.Object3D | null = obj
        while (parent && parent.userData) {
          if (parent.userData.isArtwork) {
            // Check distance (interaction range)
            if (intersects[i].distance < 6.0) {
              foundIndex = parent.userData.index
            }
            break
          }
          parent = parent.parent
        }
        if (foundIndex !== null) break
      }
      
      if (foundIndex !== currentHoveredIndex) {
        currentHoveredIndex = foundIndex
        setSelectedIndex(foundIndex)
        if (foundIndex !== null) {
          setInteractionPrompt(`[E] INSPECCIONAR: ${ARTWORKS[foundIndex].title.toUpperCase()}`)
          sound.playHover()
        } else {
          setInteractionPrompt(null)
>>>>>>> 62bbc4c3a127513cf434ac2303bb49841caf3450
        }
      }
      
    }, 100) // 10 ticks per second is enough for UI prompts

    return () => {
      clearInterval(interval)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [camera, scene, onInspectArtwork, isStarted])

  return (
    <group ref={group} position={[0, 0, 0]}>
      <ambientLight intensity={0.6} />

      {!reducedMotion && (
        <>
          <Sparkles
            count={200}
            scale={[30, 10, 30]}
            size={2.2}
            speed={0.35}
            opacity={0.4}
            color="#2B3BE5"
          />
          <Sparkles
            count={100}
            scale={[25, 8, 25]}
            size={2.8}
            speed={0.25}
            opacity={0.45}
            color="#D4AF37"
          />
        </>
      )}

<<<<<<< HEAD
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

              {/* Borde Biselado Dorado / Kintsugi */}
              <mesh position={[0, 0, 0.065]}>
                <boxGeometry args={[3.45, 4.45, 0.01]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.1} />
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
                  clearcoat={0.7}
                  clearcoatRoughness={0.15}
                  reflectivity={0.8}
                />
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
                <meshStandardMaterial map={reversoTexture} roughness={0.7} metalness={0.3} />
              </mesh>
            </group>

            {/* Placa Informativa de Bronce Iluminada debajo del Cuadro */}
            <mesh position={[0, -2.5, 0.08]}>
              <planeGeometry args={[2.2, 0.35]} />
              <meshStandardMaterial color="#D4AF37" emissive="#D4AF37" emissiveIntensity={0.25} />
            </mesh>
          </group>
        )
      })}
=======
      {items.map((item, i) => (
        <TextureErrorBoundary
          key={i}
          label={item.title}
          fallback={
            <FallbackFrame
              position={item.position}
              rotation={item.rotation}
              scale={item.scale}
              title={item.title}
            />
          }
        >
          <GalleryItem
            index={i}
            isSelected={selectedIndex === i}
            reducedMotion={reducedMotion}
            {...item}
          />
        </TextureErrorBoundary>
      ))}
>>>>>>> 62bbc4c3a127513cf434ac2303bb49841caf3450
    </group>
  )
}
