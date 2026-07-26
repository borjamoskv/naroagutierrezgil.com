export const PORTAL = 'https://naroagutierrezgil.com'

export interface Artwork {
  id: number
  url: string
  title: string
  href: string
  year: string
  medium: string
  description: string
}

// Las 8 obras de la sala 3D con metadatos extendidos para la experiencia interactiva
export const ARTWORKS: Artwork[] = [
  {
    id: 1,
    url: '/assets/marilyn-rocks--qPeLHxE.webp',
    title: 'Marilyn Rocks',
    href: `${PORTAL}/obra/marilyn-rocks/`,
    year: '2024',
    medium: 'Óleo y Acrílico sobre Lienzo',
    description: 'Reinterpretación hiperrealista con textura gestual y capas de fricción sobre la iconografía de Marilyn Monroe.'
  },
  {
    id: 2,
    url: '/assets/hq-amy-BRTriASV.webp',
    title: 'Amy Rocks',
    href: `${PORTAL}/obra/amy-rocks/`,
    year: '2024',
    medium: 'Técnica Mixta y Pigmentos Industriales',
    description: 'Retrato de Amy Winehouse capturando la crudeza emocional y la vibración del alma soul a través de trazos viscerales.'
  },
  {
    id: 3,
    url: '/assets/hq-james-CjsTrO7r.webp',
    title: 'James Rocks',
    href: `${PORTAL}/obra/james-rocks/`,
    year: '2024',
    medium: 'Óleo sobre Lienzo de Gran Formato',
    description: 'Estudio de mirada y rebeldía de James Dean en tonos contrastantes e iluminación dramática.'
  },
  {
    id: 4,
    url: '/assets/hq-johnny-5ueL8eU0.webp',
    title: 'Johnny Rocks',
    href: `${PORTAL}/obra/johnny-rocks/`,
    year: '2024',
    medium: 'Óleo y Grafito Compreso',
    description: 'Texturas profundas y matices oscuros en la efigie de Johnny Depp, fusionando realismo y expresionismo.'
  },
  {
    id: 5,
    url: '/assets/celia-cruz-cantinflowers-DO-SRKMB.webp',
    title: 'Asúcar (Celia Cruz)',
    href: `${PORTAL}/obra/asucar-celia-cruz/`,
    year: '2024',
    medium: 'Acrílico Vibrante y Pan de Oro',
    description: 'Homenaje cromático desbordante a la reina de la salsa con patrones florales y energía rítmica.'
  },
  {
    id: 6,
    url: '/assets/baroque-farrokh-mjg4ClA9.webp',
    title: 'Baroque Farrokh',
    href: `${PORTAL}/obra/baroque-farrokh/`,
    year: '2024',
    medium: 'Técnica Mixta Barroca Contemporánea',
    description: 'Freddie Mercury en clave barroca industrial, combinando la magnificencia operística con el espíritu del rock.'
  },
  {
    id: 7,
    url: '/assets/divinos-marilyn-By8KYPMI.webp',
    title: 'Divinos: Marilyn',
    href: `${PORTAL}/obra/`,
    year: '2024',
    medium: 'Serie Divinos — Edición Especial',
    description: 'Pieza de la serie Divinos que explora el mito, la luz de neón y la fragilidad del icono pop.'
  },
  {
    id: 8,
    url: '/assets/divinos-johnny-gl9M1ZKj.webp',
    title: 'Divinos: Johnny',
    href: `${PORTAL}/obra/`,
    year: '2024',
    medium: 'Serie Divinos — Pigmentos & Luz',
    description: 'Exploración de la dualidad mítica en la serie Divinos mediante contrastes de sombras saturadas.'
  },
]
