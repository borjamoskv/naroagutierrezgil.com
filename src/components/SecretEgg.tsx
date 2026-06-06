'use client'
import { useEffect } from 'react'

export default function SecretEgg() {
  useEffect(() => {
    let keyBuffer = ''
    const secretCode = 'naroa'

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow only letters to keep buffer clean and avoid massive memory or strange inputs
      if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
        keyBuffer += e.key.toLowerCase()
        
        // Keep buffer size limited to the secret code length
        if (keyBuffer.length > secretCode.length) {
          keyBuffer = keyBuffer.slice(-secretCode.length)
        }

        if (keyBuffer === secretCode) {
          // Trigger the Easter Egg
          window.location.href = 'https://borjamoskv.com'
        }
      } else if (e.key === 'Backspace') {
        keyBuffer = keyBuffer.slice(0, -1)
      } else {
        keyBuffer = ''
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return null
}
