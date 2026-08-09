export const PORTAL = 'https://naroagutierrezgil.com'

export interface Artwork {
  id: number
  slug: string
  url: string
  title: string
  href: string
  year: string
  medium: string
  description: string
  sizeCategory?: 'colossal' | 'large' | 'medium' | 'small'
  splatUrl?: string
}

export const ARTWORKS: Artwork[] = [
  {
    id: 1,
    slug: 'marilyn-rocks',
    url: '/assets/marilyn-rocks--qPeLHxE.webp',
    title: 'Marilyn Rocks',
    href: '#obra-marilyn-rocks',
    year: '2024',
    medium: 'Óleo y Acrílico sobre Lienzo',
    description: 'Reinterpretación hiperrealista con textura gestual y capas de fricción sobre la iconografía de Marilyn Monroe.',
    sizeCategory: 'colossal',
    splatUrl: 'https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/shoe/shoe.splat'
  },
  {
    id: 2,
    slug: 'amy-rocks',
    url: '/assets/hq-amy-BRTriASV.webp',
    title: 'Amy Rocks',
    href: '#obra-amy-rocks',
    year: '2024',
    medium: 'Acrílico y Posca sobre Pizarra Natural con Mica Mineral',
    description: 'Retrato de Amy Winehouse capturando la crudeza emocional y la vibración del alma soul a través de trazos viscerales sobre pizarra negra.',
    sizeCategory: 'colossal',
    splatUrl: 'https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/chair/chair.splat'
  },
  {
    id: 3,
    slug: 'james-rocks',
    url: '/assets/hq-james-CjsTrO7r.webp',
    title: 'James Rocks',
    href: '#obra-james-rocks',
    year: '2024',
    medium: 'Óleo sobre Lienzo de Gran Formato',
    description: 'Estudio de mirada y rebeldía de James Dean en tonos contrastantes e iluminación dramática.',
    sizeCategory: 'large'
  },
  {
    id: 4,
    slug: 'johnny-rocks',
    url: '/assets/hq-johnny-5ueL8eU0.webp',
    title: 'Johnny Rocks',
    href: '#obra-johnny-rocks',
    year: '2024',
    medium: 'Óleo y Grafito Compreso sobre Pizarra',
    description: 'Texturas profundas y matices oscuros en la efigie de Johnny Depp, fusionando realismo y expresionismo.',
    sizeCategory: 'large'
  },
  {
    id: 5,
    slug: 'asucar-celia-cruz',
    url: '/assets/celia-cruz-cantinflowers-DO-SRKMB.webp',
    title: 'Asúcar (Celia Cruz)',
    href: '#obra-asucar-celia-cruz',
    year: '2024',
    medium: 'Acrílico y Collage (sobres de azúcar) sobre Lienzo 3D',
    description: 'Homenaje cromático desbordante a la reina de la salsa con patrones florales, sobres de azúcar reales y energía rítmica.',
    sizeCategory: 'colossal'
  },
  {
    id: 6,
    slug: 'baroque-farrokh',
    url: '/assets/baroque-farrokh-mjg4ClA9.webp',
    title: 'Baroque Farrokh',
    href: '#obra-baroque-farrokh',
    year: '2024',
    medium: 'Técnica Mixta Barroca Contemporánea',
    description: 'Freddie Mercury en clave barroca industrial, combinando la magnificencia operística con el espíritu del rock.',
    sizeCategory: 'large'
  },
  {
    id: 7,
    slug: 'divinos-marilyn',
    url: '/assets/divinos-marilyn-By8KYPMI.webp',
    title: 'Divinos: Marilyn',
    href: '#obra-divinos-marilyn',
    year: '2024',
    medium: 'Serie Divinos — Acrílico & Mica',
    description: 'Pieza de la serie Divinos que explora el mito, la luz de neón y la fragilidad del icono pop.',
    sizeCategory: 'medium'
  },
  {
    id: 8,
    slug: 'divinos-johnny',
    url: '/assets/divinos-johnny-gl9M1ZKj.webp',
    title: 'Divinos: Johnny',
    href: '#obra-divinos-johnny',
    year: '2024',
    medium: 'Serie Divinos — Pigmentos & Luz',
    description: 'Exploración de la dualidad mítica en la serie Divinos mediante contrastes de sombras saturadas.',
    sizeCategory: 'medium'
  },
  {
    id: 9,
    slug: 'divinos-amy',
    url: '/assets/divinos-amy-Celol3XJ.webp',
    title: 'Divinos: Amy',
    href: '#obra-divinos-amy',
    year: '2024',
    medium: 'Serie Divinos — Pizarra & Pigmentos',
    description: 'La presencia magnética de Amy Winehouse tratada con la solemnidad sacra de la serie DiviNos.',
    sizeCategory: 'colossal'
  },
  {
    id: 10,
    slug: 'el-gran-dakari',
    url: '/assets/el-gran-dakari-C1tAWAhR.webp',
    title: 'El Gran Dakari',
    href: '#obra-el-gran-dakari',
    year: '2024',
    medium: 'Acrílico sobre Pizarra Natural',
    description: 'Fuerza animal hiperrealista inmortalizada sobre la dureza del soporte de pizarra.',
    sizeCategory: 'medium'
  },
  {
    id: 11,
    slug: 'audrey-hepburn',
    url: '/assets/audrey-hepburn-DbIBTtIp.webp',
    title: 'Audrey Hepburn',
    href: '#obra-audrey-hepburn',
    year: '2023',
    medium: 'Técnica Mixta y Mica Mineral',
    description: 'La delicadeza atemporal de Audrey contrapuesta con el carácter de la mica mineral y trazos pop.',
    sizeCategory: 'medium'
  },
  {
    id: 12,
    slug: 'geisha',
    url: '/assets/geisha-MfRtKWdu.webp',
    title: 'Geisha',
    href: '#obra-geisha',
    year: '2023',
    medium: 'Óleo y Pan de Oro sobre Pizarra',
    description: 'Tradición y modernidad en un retrato hipnótico con pigmentos tradicionales y toques dorados.',
    sizeCategory: 'medium'
  },
  {
    id: 13,
    slug: 'lagrimas-de-oro',
    url: '/assets/lagrimas-de-oro-DikHc-Tk.webp',
    title: 'Lágrimas de Oro',
    href: '#obra-lagrimas-de-oro',
    year: '2023',
    medium: 'Pan de Oro de 24k y Acrílico',
    description: 'Detalle expresionista de mirada sobrecogedora con lágrimas de pan de oro genuino.',
    sizeCategory: 'small'
  },
  {
    id: 14,
    slug: 'love',
    url: '/assets/love-DA7L_L5F.webp',
    title: 'Love',
    href: '#obra-love',
    year: '2023',
    medium: 'Collage & Acrílico Pop',
    description: 'Composición tipográfica y figurativa sobre el afecto contemporáneo.',
    sizeCategory: 'small'
  },
  {
    id: 15,
    slug: 'la-pensadora',
    url: '/assets/la-pensadora-CFHSnMA0.webp',
    title: 'La Pensadora',
    href: '#obra-la-pensadora',
    year: '2023',
    medium: 'Óleo sobre Lienzo',
    description: 'Estudio de la introspección femenina con juego cromático frío.',
    sizeCategory: 'small'
  },
  {
    id: 16,
    slug: 'amor-en-conserva',
    url: '/assets/amor-en-conserva-CMHRIKXx.webp',
    title: 'Amor en Conserva',
    href: '#obra-amor-en-conserva',
    year: '2024',
    medium: 'Serie En.lata — Reciclaje Artístico',
    description: 'Lata metálica reciclada convertida en escultura de memoria y afectos.',
    sizeCategory: 'small'
  },
  {
    id: 17,
    slug: 'cantinflas-i',
    url: '/assets/cantinflas-0-D712oJYO.webp',
    title: 'Cantinflas I',
    href: '#obra-cantinflas-i',
    year: '2024',
    medium: 'Acrílico y Collage Humorístico',
    description: 'Homenaje al legendario cómico mexicano con espíritu festivo y pop.',
    sizeCategory: 'medium'
  },
  {
    id: 18,
    slug: 'dar-la-lata',
    url: '/assets/dar-la-lata-DxWlKgS-.webp',
    title: 'Dar la Lata',
    href: '#obra-dar-la-lata',
    year: '2024',
    medium: 'Serie En.lata — Escultura Mixta',
    description: 'El arte de reutilizar objetos cotidianos y dotarlos de carga poética.',
    sizeCategory: 'medium'
  },
  {
    id: 19,
    slug: 'mr-fahrenheit',
    url: '/assets/mr-fahrenheit-BzcoVisa.webp',
    title: 'Mr. Fahrenheit',
    href: '#obra-mr-fahrenheit',
    year: '2024',
    medium: 'Pintura sobre Pizarra Natural',
    description: 'Freddie Mercury en plena explosión escénica capturado en trazo vivo.',
    sizeCategory: 'small'
  },
  {
    id: 20,
    slug: 'tedas-queen',
    url: '/assets/tedas-queen-GT9W8egT.webp',
    title: 'Tedás Queen',
    href: '#obra-tedas-queen',
    year: '2024',
    medium: 'Serie Divinos — Mixta Pop',
    description: 'Sátira y devoción pop en un lienzo de color saturado.',
    sizeCategory: 'medium'
  },
  {
    id: 21,
    slug: 'hammock-in-tin',
    url: '/assets/hammock-in-tin-XD5nAoyg.webp',
    title: 'Hammock in Tin',
    href: '#obra-hammock-in-tin',
    year: '2023',
    medium: 'Objeto En.lata Intervenido',
    description: 'Micromundo de verano preservado dentro de una caja metálica.',
    sizeCategory: 'small'
  },
  {
    id: 22,
    slug: 'sardine-tin-collage',
    url: '/assets/sardine-tin-collage-Bo41LZ-o.webp',
    title: 'Sardine Tin Collage',
    href: '#obra-sardine-tin-collage',
    year: '2023',
    medium: 'Ensamblaje & Pigmentos',
    description: 'Construcción figurativa dentro de latas de conserva industriales.',
    sizeCategory: 'small'
  },
  {
    id: 23,
    slug: 'en-caja',
    url: '/assets/en-caja-CDdrJMsP.webp',
    title: 'En Caja',
    href: '#obra-en-caja',
    year: '2023',
    medium: 'Caja de Madera & Óleo',
    description: 'El confinamiento expresivo en una caja tridimensional.',
    sizeCategory: 'small'
  },
  {
    id: 24,
    slug: 'soy-un-amor-y-tengo-alas',
    url: '/assets/soy-un-amor-y-tengo-alas-ItTo7aOd.webp',
    title: 'Soy un Amor y tengo Alas',
    href: '#obra-soy-un-amor-y-tengo-alas',
    year: '2023',
    medium: 'Acrílico & Plumas de Oro',
    description: 'Expresión de vuelo y dulzura en formato mediano.',
    sizeCategory: 'small'
  },
  {
    id: 25,
    slug: 'the-golden-couple',
    url: '/assets/the-golden-couple-C9C95N75.webp',
    title: 'The Golden Couple',
    href: '#obra-the-golden-couple',
    year: '2024',
    medium: 'Pareja por Encargo — Pan de Oro & Pizarra',
    description: 'Ejemplo emblemático de retrato de pareja por encargo en acrílico y oro.',
    sizeCategory: 'medium'
  },
  {
    id: 26,
    slug: 'pink-and-sparkles',
    url: '/assets/pink-and-sparkles-c4K6RUzC.webp',
    title: 'Pink and Sparkles',
    href: '#obra-pink-and-sparkles',
    year: '2024',
    medium: 'Acrílico Neón & Destellos Minerales',
    description: 'Vibración rosa pop con destellos de mica mineral pura.',
    sizeCategory: 'medium'
  },
  {
    id: 27,
    slug: 'monster-dragon',
    url: '/assets/monster-dragon-QQiqdImO.webp',
    title: 'Monster Dragon',
    href: '#obra-monster-dragon',
    year: '2024',
    medium: 'Ilustración Texturizada sobre Pizarra',
    description: 'Fantaseo figurativo con trazo agresivo y contornos neón.',
    sizeCategory: 'small'
  }
]
