import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import { usePlayerControls } from '../hooks/usePlayerControls'
import { sound } from '../utils/audio'

const MOVEMENT_SPEED = 5.0
const SPRINT_MULTIPLIER = 1.8
const DAMPING = 8.0 // Fricción/Inercia

interface FirstPersonControllerProps {
  onPlayerMove?: (pos: { x: number; z: number }, rotY: number) => void
}

export function FirstPersonController({ onPlayerMove }: FirstPersonControllerProps) {
  const { forward, backward, left, right, sprint } = usePlayerControls()
  const { camera } = useThree()
  
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  
  // Para el head bobbing (balanceo al caminar)
  const headBobTimer = useRef(0)

  useEffect(() => {
    // Configuración inicial de la cámara
    camera.position.set(0, 1.7, 5) // Altura promedio del jugador
  }, [camera])

  useFrame((_, delta) => {
    // 1. Aplicar fricción / inercia a la velocidad actual
    velocity.current.x -= velocity.current.x * DAMPING * delta
    velocity.current.z -= velocity.current.z * DAMPING * delta

    // 2. Determinar las intenciones de movimiento basado en WASD
    direction.current.set(
      Number(right) - Number(left),
      0,
      Number(backward) - Number(forward)
    )
    direction.current.normalize() // Normalizar para evitar moverse más rápido en diagonal

    const speed = sprint ? MOVEMENT_SPEED * SPRINT_MULTIPLIER : MOVEMENT_SPEED
    const isMoving = direction.current.length() > 0

    if (isMoving) {
      // Aplicar aceleración
      velocity.current.x += direction.current.x * speed * delta
      velocity.current.z += direction.current.z * speed * delta
    }

    // 3. Aplicar movimiento relativo a hacia dónde mira la cámara (sin afectar el Y)
    const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
    forwardVector.y = 0
    forwardVector.normalize()

    const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
    rightVector.y = 0
    rightVector.normalize()

    // Sumar los vectores de velocidad transformada a la posición de la cámara
    camera.position.addScaledVector(rightVector, velocity.current.x)
    camera.position.addScaledVector(forwardVector, -velocity.current.z)

    // 4. Lógica de Head Bobbing (Balanceo de cabeza al caminar) + Sonido de Pisadas
    if (isMoving) {
      const prevSin = Math.sin(headBobTimer.current)
      headBobTimer.current += delta * (sprint ? 12 : 8)
      const currentSin = Math.sin(headBobTimer.current)

      // Reproducir sonido al tocar suelo (cruzar cero hacia arriba)
      if (prevSin < 0 && currentSin >= 0) {
        sound.playStep()
      }

      camera.position.y = 1.7 + currentSin * 0.05
    } else {
      // Regresar suavemente a la altura base si no se está moviendo
      camera.position.y += (1.7 - camera.position.y) * 10 * delta
    }

    // 5. Limitar la posición del jugador (Muros invisibles)
    const dist = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2)
    if (dist > 13) {
      camera.position.x *= 13 / dist
      camera.position.z *= 13 / dist
    }

    // 6. Reportar posición y rotación al Minimapa
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ')
    onPlayerMove?.({ x: camera.position.x, z: camera.position.z }, euler.y)
  })

  return <PointerLockControls />
}
