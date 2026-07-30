export interface Artwork {
  id: string;
  slug: string;
  title: string;
  year?: number;
  description?: string;
  technique: string;
  materials: string[];
  dimensions?: string;
  support: string;
  price?: number | null;
  availability: "Disponible" | "Reservado" | "Colección privada" | "Vendido";
  image: string;
  images?: string[];
  series?: string;
}

export const artworkData: Artwork[] = [
  {
    id: 'amy-winehouse',
    slug: 'amy-winehouse',
    title: 'Amy Winehouse',
    year: 2023,
    description: 'Trazos sinuosos grabados sobre pizarra vasca recuperada con disoluciones de resina epoxi de alta viscosidad y pigmento mineral puro.',
    technique: 'Acrílico y resina epoxi',
    materials: ['Acrílico', 'Resina epoxi', 'Pigmento mineral puro'],
    support: 'Pizarra vasca recuperada',
    dimensions: '100 × 80 × 3 cm',
    price: null,
    availability: 'Disponible',
    image: 'amy-new.webp',
    series: 'El Retrato Pop'
  },
  {
    id: 'james-dean',
    slug: 'james-dean',
    title: 'James Dean',
    year: 2023,
    description: 'Rostros icónicos del cine se plasman sobre un soporte indómito, logrando una confrontación de alta fidelidad entre la saturación del acrílico y la aspereza del basalto.',
    technique: 'Acrílico',
    materials: ['Acrílico'],
    support: 'Pizarra basáltica',
    dimensions: '120 × 90 × 4 cm',
    price: null,
    availability: 'Disponible',
    image: 'james-new.webp',
    series: 'El Retrato Pop'
  },
  {
    id: 'marilyn',
    slug: 'marilyn',
    title: 'Marilyn Monroe',
    year: 2022,
    description: 'Tensión vibrante entre la figura clásica y el soporte orgánico y fracturado, elevando el retrato a un nivel escultórico.',
    technique: 'Acrílico',
    materials: ['Acrílico', 'Barniz'],
    support: 'Pizarra basáltica',
    dimensions: '100 × 80 × 3 cm',
    price: null,
    availability: 'Colección privada',
    image: 'marilyn-new.webp',
    series: 'El Retrato Pop'
  },
  {
    id: 'espejo-alma',
    slug: 'espejo-alma',
    title: 'Espejo del Alma',
    year: 2021,
    description: 'Sometidas a cortes geográficos, sellado con resina epoxi de brillo espejo y rematadas con bordes rotos.',
    technique: 'Sellado con resina epoxi',
    materials: ['Resina epoxi'],
    support: 'Pizarra de derribo de tejados tradicionales',
    dimensions: '40 × 30 cm',
    price: null,
    availability: 'Disponible',
    image: 'espejo-alma-piensa.webp',
    series: 'Pizarra Centenaria'
  },
  {
    id: 'cantinflas',
    slug: 'cantinflas',
    title: 'Cantinflas',
    year: 2020,
    description: 'La costra del lienzo se resquebraja al secarse. La artista raspa la herida y la rellena con barnices de oro, transformando la falla física en una veta de luz.',
    technique: 'Kintsugi y técnica mixta',
    materials: ['Cola blanca', 'Acrílico', 'Barniz de oro'],
    support: 'Lienzo',
    dimensions: '80 × 60 cm',
    price: null,
    availability: 'Vendido',
    image: 'cantinflas-kintsugi.webp',
    series: 'Kintsugi Accidental'
  },
  {
    id: 'dakari',
    slug: 'el-gran-dakari',
    title: 'El Gran Dakari',
    year: 2023,
    description: 'Escamas de mica mineral encoladas que reflejan destellos aleatorios según el punto de vista del espectador, con pupilas en capas cerámicas 3D.',
    technique: 'Relieve cerámico 3D y encolado',
    materials: ['Mica mineral', 'Cerámica líquida', 'Barniz de vidrio'],
    support: 'Madera',
    dimensions: '90 × 70 cm',
    price: null,
    availability: 'Disponible',
    image: 'el-gran-dakari-C1tAWAhR.webp',
    series: 'La Mica Mineral'
  },
  {
    id: 'naroa-portrait',
    slug: 'reverso-acustico',
    title: 'El Reverso Acústico',
    year: 2024,
    description: 'El lienzo físico guarda secretos en su reverso: cartas escritas por el retratado, códigos QR que reproducen un paisaje acústico electrónico.',
    technique: 'Acrílico y arte sonoro interactivo',
    materials: ['Acrílico', 'Código QR impreso'],
    support: 'Lienzo',
    dimensions: '100 × 100 cm',
    price: null,
    availability: 'Disponible',
    image: 'naroa-portrait-new.webp',
    series: 'Autorretrato'
  },
  {
    id: 'siluetas-flotantes',
    slug: 'siluetas-flotantes',
    title: 'Siluetas Flotantes',
    year: 2022,
    description: 'Un laboratorio químico de tintas diluidas con agua de colonia. Los trazos disueltos sobre poliéster translúcido crean siluetas orgánicas flotantes.',
    technique: 'Tintas diluidas con agua de colonia',
    materials: ['Tinta alcohólica'],
    support: 'Papel Poliéster Translúcido',
    dimensions: '70 × 50 cm',
    price: null,
    availability: 'Disponible',
    image: '612329591_1571120784367337_8798688892093004057_n.webp',
    series: 'Poliéster Translúcido'
  }
];
