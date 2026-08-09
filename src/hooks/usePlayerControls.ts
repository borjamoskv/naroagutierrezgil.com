import { useState, useEffect } from 'react'

export function usePlayerControls() {
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is inside an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setMovement((m) => ({ ...m, forward: true }))
          break
        case 'KeyS':
        case 'ArrowDown':
          setMovement((m) => ({ ...m, backward: true }))
          break
        case 'KeyA':
        case 'ArrowLeft':
          setMovement((m) => ({ ...m, left: true }))
          break
        case 'KeyD':
        case 'ArrowRight':
          setMovement((m) => ({ ...m, right: true }))
          break
        case 'ShiftLeft':
        case 'ShiftRight':
          setMovement((m) => ({ ...m, sprint: true }))
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setMovement((m) => ({ ...m, forward: false }))
          break
        case 'KeyS':
        case 'ArrowDown':
          setMovement((m) => ({ ...m, backward: false }))
          break
        case 'KeyA':
        case 'ArrowLeft':
          setMovement((m) => ({ ...m, left: false }))
          break
        case 'KeyD':
        case 'ArrowRight':
          setMovement((m) => ({ ...m, right: false }))
          break
        case 'ShiftLeft':
        case 'ShiftRight':
          setMovement((m) => ({ ...m, sprint: false }))
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return movement
}
