export function PremiumFooter() {
  return (
    <footer className="premium-footer">
      <div className="premium-footer-left">
        <span>© 2026 NAROA GUTIÉRREZ GIL · BILBAO</span>
        <a href="mailto:naroa@naroa.eu" className="premium-footer-link">
          naroa@naroa.eu
        </a>
        <span style={{ opacity: 0.5 }}>|</span>
        <span style={{ fontSize: '0.7rem', color: '#D4AF37', fontFamily: 'var(--font-mono)' }}>
          🎵 BSO: Boards of Burgos (Borja Moskv)
        </span>
      </div>
      <div className="coordinates">BOLUETA // 43.2497° N, 2.9067° W</div>
    </footer>
  )
}
