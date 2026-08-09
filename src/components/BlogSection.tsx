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
    title: 'Exposición Hiperrealismo POP en Bilbao',
    URL: 'https://naroagutierrez.wordpress.com/',
    date: '2026-06-15',
    excerpt: 'Reflexiones sobre el proceso de pintar Amy Winehouse y Marilyn Monroe sobre placas de pizarra natural con mica mineral.'
  },
  {
    id: 2,
    title: 'El Secreto de la Mica Mineral en el Arte',
    URL: 'https://naroagutierrez.wordpress.com/',
    date: '2026-05-20',
    excerpt: 'Cómo los destellos naturales del cuarzo y la mica transforman la luz en los retratos según la posición del espectador.'
  },
  {
    id: 3,
    title: 'Serie DiviNos & Tributos Musicales',
    URL: 'https://naroagutierrez.wordpress.com/',
    date: '2026-04-10',
    excerpt: 'Un recorrido por las piezas dedicadas a Freddie Mercury, Celia Cruz, Camarón de la Isla y Johnny Depp.'
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
    <div className="blog-page brutal-container">
      <div className="brutal-marquee-bar brutal-marquee-bar--cyan">
        <div className="brutal-marquee-content">
          <span>🟢 WORDPRESS LIVE SYNC · NAROAGUTIERREZ.WORDPRESS.COM · DIARIO DE ARTE · REFLEXIONES DE NAROA GUTIÉRREZ GIL 🟢</span>
          <span>🟢 WORDPRESS LIVE SYNC · NAROAGUTIERREZ.WORDPRESS.COM · DIARIO DE ARTE · REFLEXIONES DE NAROA GUTIÉRREZ GIL 🟢</span>
        </div>
      </div>

      <header className="blog-header">
        <span className="brutal-badge brutal-badge--yellow">DIARIO DE ARTE</span>
        <h1 className="brutal-title">
          REFLEXIONES Y <span className="highlight-pink">PROCESOS</span>
        </h1>
        <p className="brutal-subtitle">
          Pensamientos, textos de exposiciones y avances del taller de Naroa en Bilbao sincronizados en tiempo real.
        </p>
      </header>

      {loading && (
        <div className="loader-text" style={{ margin: '20px 0' }}>
          CARGANDO BITÁCORA EN TIEMPO REAL DESDE WORDPRESS...
        </div>
      )}

      <div className="blog-grid">
        {posts.map(post => (
          <article key={post.id} className="blog-card brutal-card">
            <span className="blog-date">{new Date(post.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <h2 className="blog-post-title">{post.title}</h2>
            <div
              className="blog-excerpt"
              dangerouslySetInnerHTML={{ __html: post.excerpt }}
            />
            <a
              href={post.URL}
              target="_blank"
              rel="noopener noreferrer"
              className="brutal-btn"
              style={{ marginTop: '14px', textDecoration: 'none' }}
            >
              LEER EN WORDPRESS ↗
            </a>
          </article>
        ))}
      </div>
    </div>
  )
}
