import { useEffect, useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture, Html } from '@react-three/drei'
import * as THREE from 'three'
import { ARTWORKS } from '../artworks'

interface GalleryProps {
  onInspectArtwork: (index: number) => void
  isStarted: boolean
  setInteractionPrompt: (prompt: string | null) => void
}

export function Gallery({ onInspectArtwork, isStarted, setInteractionPrompt }: GalleryProps) {
  const { camera, scene } = useThree()
  const artworks = useMemo(() => ARTWORKS, [])
  const textures = useTexture(artworks.map(a => a.url))
  
  const wallRefs = useRef<(THREE.Mesh | null)[]>([])
  const raycaster = useRef(new THREE.Raycaster())
  const center = useRef(new THREE.Vector2(0, 0))

  // Configurar escena
  useEffect(() => {
    scene.fog = new THREE.Fog('#050508', 5, 30)
    scene.background = new THREE.Color('#050508')
  }, [scene])

  // Lógica de interacción (Raycasting)
  useFrame(() => {
    if (!isStarted) return

    raycaster.current.setFromCamera(center.current, camera)
    const intersects = raycaster.current.intersectObjects(scene.children, true)
    
    let found = false
    for (let i = 0; i < intersects.length; i++) {
      const obj = intersects[i].object
      if (obj.userData.isArtwork && intersects[i].distance < 4) {
        setInteractionPrompt(`Presiona E para inspeccionar: ${obj.userData.title}`)
        found = true
        
        // Efecto de brillo en la obra cercana
        const mesh = obj as THREE.Mesh
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.emissive.set('#2B3BE5')
          mesh.material.emissiveIntensity = 0.2
        }
        break
      }
    }
    
    if (!found) {
      setInteractionPrompt(null)
      // Resetear brillos
      wallRefs.current.forEach(mesh => {
        if (mesh && mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.emissive.set('#000000')
          mesh.material.emissiveIntensity = 0
        }
      })
    }
  })

  // Manejar tecla E
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && isStarted) {
        raycaster.current.setFromCamera(center.current, camera)
        const intersects = raycaster.current.intersectObjects(scene.children, true)
        
        for (let i = 0; i < intersects.length; i++) {
          const obj = intersects[i].object
          if (obj.userData.isArtwork && intersects[i].distance < 4) {
            onInspectArtwork(obj.userData.index)
            break
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [camera, scene, onInspectArtwork, isStarted])

  return (
    <group>
      {/* Suelo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0A0A0A" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Paredes de la galería */}
      <mesh position={[0, 3, -15]} receiveShadow>
        <planeGeometry args={[30, 6]} />
        <meshStandardMaterial color="#111115" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3, 15]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[30, 6]} />
        <meshStandardMaterial color="#111115" roughness={0.8} />
      </mesh>
      <mesh position={[-15, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[30, 6]} />
        <meshStandardMaterial color="#111115" roughness={0.8} />
      </mesh>
      <mesh position={[15, 3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[30, 6]} />
        <meshStandardMaterial color="#111115" roughness={0.8} />
      </mesh>

      {/* Iluminación dramática */}
      <ambientLight intensity={0.2} />
      <spotLight position={[0, 5, 0]} angle={0.5} penumbra={1} intensity={1.5} color="#2B3BE5" castShadow />
      <pointLight position={[10, 4, 10]} intensity={0.5} color="#F59E0B" />
      <pointLight position={[-10, 4, -10]} intensity={0.5} color="#F59E0B" />

      {/* Obras de arte en las paredes */}
      {artworks.map((art, i) => {
        // Distribuir obras en las paredes
        const wallIndex = i % 4
        const itemsPerWall = Math.ceil(artworks.length / 4)
        const indexInWall = Math.floor(i / 4)
        const offset = (indexInWall - (itemsPerWall - 1) / 2) * 6

        let position: [number, number, number] = [0, 3, 0]
        let rotation: [number, number, number] = [0, 0, 0]

        switch (wallIndex) {
          case 0: // Pared Norte
            position = [offset, 3, -14.9]
            rotation = [0, 0, 0]
            break
          case 1: // Pared Este
            position = [14.9, 3, offset]
            rotation = [0, -Math.PI / 2, 0]
            break
          case 2: // Pared Sur
            position = [offset, 3, 14.9]
            rotation = [0, Math.PI, 0]
            break
          case 3: // Pared Oeste
            position = [-14.9, 3, offset]
            rotation = [0, Math.PI / 2, 0]
            break
        }

        return (
          <group key={art.id} position={position} rotation={rotation}>
            {/* Marco */}
            <mesh position={[0, 0, -0.1]}>
              <boxGeometry args={[3.4, 4.4, 0.1]} />
              <meshStandardMaterial color="#1A1A1A" roughness={0.2} metalness={0.8} />
            </mesh>
            {/* Lienzo */}
            <mesh
              ref={el => (wallRefs.current[i] = el)}
              userData={{ isArtwork: true, index: i, title: art.title }}
              onClick={() => !isStarted && onInspectArtwork(i)}
              onPointerOver={e => (document.body.style.cursor = 'pointer')}
              onPointerOut={e => (document.body.style.cursor = 'auto')}
            >
              <planeGeometry args={[3, 4]} />
              <meshStandardMaterial 
                map={textures[i]} 
                roughness={0.4} 
                metalness={0.1}
              />
            </mesh>
            {/* Placa de información */}
            <mesh position={[0, -2.6, 0]}>
              <planeGeometry args={[2, 0.4]} />
              <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.2} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
