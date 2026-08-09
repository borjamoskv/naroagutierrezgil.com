import React, { useEffect } from 'react'

interface TelemetryPixelProps {
  currentView: string
  activeArtworkSlug?: string
}

export const TelemetryPixel: React.FC<TelemetryPixelProps> = ({ currentView, activeArtworkSlug }) => {
  useEffect(() => {
    try {
      const payload = {
        ts: Date.now(),
        view: currentView,
        artwork: activeArtworkSlug || null,
        ua: navigator.userAgent,
        ref: document.referrer,
        screen: `${window.innerWidth}x${window.innerHeight}`,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone
      }

      // Fire-and-forget async beacon telemetry (Non-blocking)
      const dataStr = JSON.stringify(payload)
      if (navigator.sendBeacon) {
        const blob = new Blob([dataStr], { type: 'application/json' })
        navigator.sendBeacon('/api/telemetry/pixel', blob)
      } else {
        const img = new Image(1, 1)
        img.src = `/pixel.gif?v=${encodeURIComponent(currentView)}&t=${Date.now()}`
      }
    } catch {
      // Ignore telemetry errors (silent fire & forget)
    }
  }, [currentView, activeArtworkSlug])

  return (
    <img
      src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
      alt=""
      aria-hidden="true"
      width="1"
      height="1"
      style={{
        position: 'fixed',
        top: -9999,
        left: -9999,
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: 'none',
        zIndex: -999
      }}
    />
  )
}
