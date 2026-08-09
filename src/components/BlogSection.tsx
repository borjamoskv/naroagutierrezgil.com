import { useEffect, useState } from 'react'

interface Post {
  id: number
  title: string
  URL: string
  date: string
  excerpt: string
  featured_image?: string
}

const FALLBACK_POSTS: Post[] = [
  {
    id: 1,
    title: '«Mimo y Calma»: El secreto de empezar un retrato con una conversación',
    URL: 'https://naroagutierrez.wordpress.com/',
    date: '2026-06-15',
    excerpt: '«Cada retrato empieza con una conversación. No es sólo capturar la faceta física; es rasgar la piedra y aplicar las escamas de mica mineral con mimo y calma desde mi taller en Bolueta.»'
  },
  {
    id: 2,
    title: 'Pizarra de derribo vasco: Rescatando la memoria arquitectónica de Bizkaia',
    URL: 'https://naroagutierrez.wordpress.com/',
    date: '2026-05-20',
    excerpt: '«Las tejadas viejas de Bilbao guardan lluvia, viento y miradas. Al acoplar el acrílico sobre la piedra natural, la fragilidad del rostro pop se guarece bajo el tejado.»'
  },
  {
    id: 3,
    title: '«Dar la lata»: Conservas emocionales y la serie Facefood',
    URL: 'https://naroagutierrez.wordpress.com/',
    date: '2026-04-10',
    excerpt: '«Alimento para la vista. En la lata de conserva el rostro se inmortaliza, entre el salseo POP y la vibración cotidiana de nuestros iconos.»'
  }
]

export function BlogSection() {
  const [posts, setPosts] = useState<Post[]>(FALLBACK_POSTS)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    fetch('https://public-api.wordpress.com/rest/v1.1/sites/naroagutierrez.wordpress.com/posts/?number=6')
      .then(res => res.json())
      .then(data => {
        if (data && data.posts && data.posts.length > 0) {
          setPosts(data.posts)
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '100px auto 80px', padding: '0 24px' }}>
      {/* Ticker Tape Header */}
      <div style={{
        background: 'rgba(255, 0, 122, 0.12)',
        border: '1px solid rgba(255, 0, 122, 0.3)',
        borderRadius: '30px',
        padding: '10px 24px',
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#FF007A', fontWeight: 800 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF007A', boxShadow: '0 0 10px #FF007A' }} />
          BITÁCORA DE NARO // DIARIO DEL TALLER EN BOLUETA (BILBAO)
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#FFE600', fontWeight: 700 }}>
          ⚡ WORDPRESS LIVE SYNC · NAROAGUTIERREZ.WORDPRESS.COM
        </span>
      </div>

      <header style={{ marginBottom: '50px', textAlign: 'center' }}>
        <span style={{
          fontSize: '0.75rem',
          padding: '6px 16px',
          background: 'rgba(255, 230, 0, 0.15)',
          border: '1px solid rgba(255, 230, 0, 0.5)',
          borderRadius: '30px',
          color: '#FFE600',
          fontFamily: 'var(--font-mono)',
          fontWeight: 800,
          letterSpacing: '0.1em'
        }}>
          📖 CUADERNO DE NOTAS Y SALSEO POP
        </span>
        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 4rem)',
          fontWeight: 900,
          color: '#fff',
          margin: '16px 0 12px 0',
          letterSpacing: '-0.03em'
        }}>
          BITÁCORA DE <span className="text-pop-gradient">NARO</span>
        </h1>
        <p style={{
          fontSize: '1.05rem',
          color: 'rgba(255, 255, 255, 0.75)',
          maxWidth: '680px',
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          Anotaciones de taller, rasgados sobre pizarra, conversaciones con <em>mimo y calma</em> y reflexiones matéricas sincronizadas en tiempo real desde Bizkaia.
        </p>
      </header>

      {loading && (
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: '#00F0FF', fontSize: '0.85rem', margin: '40px 0' }}>
          ⏳ SINCRONIZANDO ANOTACIONES DE LA BITÁCORA CON NAROAGUTIERREZ.WORDPRESS.COM...
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        {posts.map(post => (
          <article
            key={post.id}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.7rem', color: '#00F0FF', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  📅 {new Date(post.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span style={{ fontSize: '0.65rem', padding: '2px 8px', background: 'rgba(255, 0, 122, 0.15)', color: '#FF007A', borderRadius: '12px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                  BOLUETA #BITÁCORA
                </span>
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: '0 0 12px 0', lineHeight: 1.3 }}>
                {post.title}
              </h2>

              <div
                style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6, marginBottom: '20px' }}
                dangerouslySetInnerHTML={{ __html: post.excerpt }}
              />
            </div>

            <a
              href={post.URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: '#FFE600',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 800,
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
            >
              LEER ANOTACIÓN COMPLETA EN WORDPRESS ↗
            </a>
          </article>
        ))}
      </div>
    </div>
  )
}
