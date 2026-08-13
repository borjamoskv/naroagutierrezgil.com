import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

export function OrbitGalleryController() {
  const { camera } = useThree()

  useEffect(() => {
    // Posición elevada para vista de pájaro / panorámica de la galería
    camera.position.set(0, 8, 18)
    camera.lookAt(0, 2, 0)
  }, [camera])

  return (
    <OrbitControls
      enableZoom={true}
      enablePan={true}
      maxPolarAngle={Math.PI / 2 - 0.05} // Impedir pasar por debajo del suelo
      minDistance={3}
      maxDistance={25}
      target={[0, 2, 0]}
      dampingFactor={0.05}
    />
  )
}
