// SYS_ID: ARTWORKS_DATA_OMEGA
// STATE: C5-REAL
// AESTHETIC: INDUSTRIAL_NOIR_2026
// CREATOR: borjamoskv

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  z: number;
  title: string;
  description: string;
  side: 'front' | 'back';
}

export interface Artwork {
  id: string;
  src: string; // Base filename without /assets/ (unless absolute)
  title: string;
  category: 'pop' | 'pizarra' | 'poliester' | 'kintsugi' | 'mica' | 'reverso' | string;
  desc?: string;
  material?: string;
  year?: string;
  audioTitle?: string;
  hotspots?: Hotspot[];
  prompt?: string; // For GoogleFlowStudio
}

export interface SimpleArtwork {
  title: string;
  year: string;
  tech: string;
  img: string;
}

export const artworksData: Artwork[] = [
  {
    id: 'james',
    src: 'james-new.webp',
    title: 'James Dean',
    category: 'pop',
    desc: 'Pop iconography on slate',
    material: 'Pizarra de Tejado Vasco',
    year: '2026',
    audioTitle: 'Summer Monroe (Naroart x Borja Moskv Rework)',
    prompt: 'Variación de contraste y grano de carbón',
    hotspots: [
      {
        id: 'pizarra',
        x: -0.4,
        y: 0.5,
        z: 0.03,
        title: 'Pizarra Centenaria',
        description: 'Pizarra de tejado vasco recuperada de derribos históricos en Bilbao, sellada con resinas epoxi y pulida a mano.',
        side: 'front'
      },
      {
        id: 'kintsugi',
        x: 0.2,
        y: -0.3,
        z: 0.03,
        title: 'Kintsugi Accidental',
        description: 'Textura de cola y acrílico resquebrajada naturalmente y rellenada con esmalte de oro líquido para sanar la grieta.',
        side: 'front'
      },
      {
        id: 'reverso-qr',
        x: 0,
        y: 0,
        z: -0.03,
        title: 'Ledger de Autenticidad',
        description: 'Firma física de la artista, QR criptográfico y enlace al re-work musical electrónico compuesto junto a Borja Moskv.',
        side: 'back'
      }
    ]
  },
  {
    id: 'amy',
    src: 'amy-new.webp',
    title: 'Amy Winehouse',
    category: 'pop',
    desc: 'Sinuous expression of voice',
    prompt: 'Humo volumétrico e iluminación cobalt'
  },
  {
    id: 'johnny',
    src: 'johnny-new.webp',
    title: 'Johnny Depp',
    category: 'pop',
    desc: 'Depth of texture & character'
  },
  {
    id: 'audrey',
    src: 'audrey-hepburn-DbIBTtIp.webp',
    title: 'Audrey Hepburn',
    category: 'pop',
    desc: 'Classic elegance on basalt'
  },
  {
    id: 'dakari',
    src: 'el-gran-dakari-C1tAWAhR.webp',
    title: 'El Gran Dakari',
    category: 'mica',
    desc: 'Shimmering minerals and glaze',
    material: 'Pizarra Vasco-Pop',
    year: '2026',
    audioTitle: 'Dakari Rhythm & Mineral Waves',
    prompt: 'Glitter mineral dinámico en las pupilas',
    hotspots: [
      {
        id: 'cantinflowers',
        x: -0.2,
        y: -0.4,
        z: 0.03,
        title: 'Fusión Cantinflowers',
        description: 'Mezcla termodinámica de cola blanca y acrílico de alta densidad que genera texturas volcánicas resquebrajadas.',
        side: 'front'
      },
      {
        id: 'pop',
        x: 0.2,
        y: 0.3,
        z: 0.03,
        title: 'Hiperrealismo Pop',
        description: 'Trazo de alta precisión y saturación cromática cobalto que desafía la naturaleza rústica del soporte de pizarra.',
        side: 'front'
      }
    ]
  },
  {
    id: 'geisha',
    src: 'geisha-MfRtKWdu.webp',
    title: 'Geisha',
    category: 'mica',
    desc: 'Mixture of gold dust and mica',
    prompt: 'Luz difusa y velo de mica translúcido'
  },
  {
    id: 'lagrimas',
    src: 'lagrimas-de-oro-DikHc-Tk.webp',
    title: 'Lágrimas de Oro',
    category: 'kintsugi',
    desc: 'Fracture lines sealed in gold',
    material: 'Técnica Mixta y Mica',
    year: '2026',
    audioTitle: 'Lágrimas de Oro (Beat & Texture Rework)',
    prompt: 'Inyección de resina con partículas de oro 24k',
    hotspots: [
      {
        id: 'mica',
        x: 0.3,
        y: 0.4,
        z: 0.03,
        title: 'Mica Shimmer',
        description: 'Láminas minerales de mica encoladas en relieve que interactúan dinámicamente según la incidencia de la luz física.',
        side: 'front'
      },
      {
        id: 'ojos',
        x: -0.1,
        y: 0.1,
        z: 0.03,
        title: 'Gesto de Cristal',
        description: 'Pupila tridimensional construida mediante microcapas superpuestas de barniz cerámico denso aplicadas con palillo.',
        side: 'front'
      },
      {
        id: 'reverso-firmas',
        x: 0.1,
        y: -0.4,
        z: -0.03,
        title: 'Sello de Creador',
        description: 'Crédito de autoría a Borja Moskv y Naroart, detallando el balance de exergía física del proceso de cocción del lienzo.',
        side: 'back'
      }
    ]
  },
  {
    id: 'espejo',
    src: '601340023_1552126202933462_7815927344957967258_n.webp',
    title: 'Espejo del Alma I',
    category: 'pizarra',
    desc: '100-year-old Basque slate base'
  },
  {
    id: 'dama',
    src: '608211438_1562089535270462_2827127275272133326_n.webp',
    title: 'Dama de la Pizarra',
    category: 'pizarra',
    desc: 'Natural slate relief work'
  },
  {
    id: 'retrato-tension',
    src: '615438426_1577822580363824_2923463327956560352_n.webp',
    title: 'Retrato en Tensión',
    category: 'pizarra',
    desc: 'Epoxi resin and slate fusion'
  },
  {
    id: 'facciones',
    src: '612329591_1571120784367337_8798688892093004057_n.webp',
    title: 'Facciones del Silencio',
    category: 'poliester',
    desc: 'Translucent polyester sketch'
  },
  {
    id: 'mirada',
    src: '622453257_1583899099756172_4197872465466826396_n.webp',
    title: 'Mirada del Tiempo',
    category: 'poliester',
    desc: 'Washed ink chemistry like X-ray'
  },
  {
    id: 'pensadora',
    src: 'la-pensadora-CFHSnMA0.webp',
    title: 'La Pensadora',
    category: 'pizarra'
  }
];

export const allArtworks: SimpleArtwork[] = [
  // 1. Obras Maestras (DiviNos)
  { title: 'Autorretrato Creador', year: '2026', tech: 'Pizarra Centenaria / Monóculo Pintado', img: '/assets/naroa-portrait-new.webp' },
  { title: 'DiviNos Amy', year: '2026', tech: 'Técnica Mixta con Hoja de Oro', img: '/assets/amy-new.webp' },
  { title: 'Marilyn en Oro', year: '2025', tech: 'Acrílico y Hoja de Oro s/ Pizarra', img: '/assets/marilyn-new.webp' },
  { title: 'El Actor y el Humo (Depp)', year: '2025', tech: 'Pizarra Bruta y Acrílico', img: '/assets/johnny-new.webp' },
  { title: 'The Golden Couple (Dean)', year: '2024', tech: 'Acrílico y Hoja de Oro', img: '/assets/james-new.webp' },
  
  // 2. Iconos y Retratos Pop
  { title: 'Cantinflowers', year: '2024', tech: 'Técnica Mixta y Resina', img: '/assets/cantinflowers-new.webp' },
  { title: 'Celia Cruz', year: '2023', tech: 'Acrílico sobre Pizarra', img: '/assets/celia-cruz-cantinflowers-DO-SRKMB.webp' },
  { title: 'Baroque Farrokh (Freddie)', year: '2022', tech: 'Acrílico y Hoja de Oro', img: '/assets/baroque-farrokh-mjg4ClA9.webp' },
  { title: 'Mr Fahrenheit', year: '2022', tech: 'Acrílico', img: '/assets/mr-fahrenheit-BzcoVisa.webp' },
  { title: 'Audrey Hepburn', year: '2024', tech: 'Acrílico sobre pizarra', img: '/assets/audrey-hepburn-DbIBTtIp.webp' },
  
  // 3. Hiperrealismo y Emoción
  { title: 'Sonrisa Mineral', year: '2023', tech: 'Hiperrealismo s/ Pizarra', img: '/assets/hq-portrait-1-bV-_WHlX.webp' },
  { title: 'Lágrimas de Oro', year: '2023', tech: 'Acrílico y Hoja de Oro', img: '/assets/lagrimas-de-oro-DikHc-Tk.webp' },
  { title: 'La Pensadora', year: '2022', tech: 'Acrílico s/ Pizarra', img: '/assets/la-pensadora-CFHSnMA0.webp' },
  { title: 'Geisha', year: '2023', tech: 'Técnica Mixta', img: '/assets/geisha-MfRtKWdu.webp' },
  { title: 'Pink and Sparkles', year: '2025', tech: 'Resina y Mica', img: '/assets/pink-and-sparkles-c4K6RUzC.webp' },
  
  // 4. Objetos y Conceptuales (Latas, etc)
  { title: 'Amor en Conserva', year: '2021', tech: 'Acrílico en Lata Reciclada', img: '/assets/amor-en-conserva-CMHRIKXx.webp' },
  { title: 'Dar la Lata', year: '2021', tech: 'Acrílico en Lata', img: '/assets/dar-la-lata-DxWlKgS-.webp' },
  { title: 'Hammock in Tin', year: '2022', tech: 'Lata y técnica mixta', img: '/assets/hammock-in-tin-XD5nAoyg.webp' },
  { title: 'En Caja', year: '2022', tech: 'Acrílico y madera', img: '/assets/en-caja-CDdrJMsP.webp' },
  { title: 'Sardine Tin Collage', year: '2021', tech: 'Collage en lata', img: '/assets/sardine-tin-collage-Bo41LZ-o.webp' },
  
  // 5. Fantasía y Varios
  { title: 'El Gran Dakari', year: '2023', tech: 'Acrílico sobre Pizarra', img: '/assets/el-gran-dakari-C1tAWAhR.webp' },
  { title: 'Monster Dragon', year: '2022', tech: 'Acrílico', img: '/assets/monster-dragon-QQiqdImO.webp' },
  { title: 'Love', year: '2022', tech: 'Acrílico', img: '/assets/love-DA7L_L5F.webp' },
  { title: 'Soy un Amor y Tengo Alas', year: '2023', tech: 'Técnica Mixta', img: '/assets/soy-un-amor-y-tengo-alas-ItTo7aOd.webp' },
  { title: 'Tedas Queen', year: '2023', tech: 'Técnica Mixta', img: '/assets/tedas-queen-GT9W8egT.webp' },

  // 6. Archivo Histórico Pizarra 
  { title: 'Espejo del Alma I', year: '2024', tech: 'Base de pizarra centenaria vasca', img: '/assets/601340023_1552126202933462_7815927344957967258_n.webp' },
  { title: 'Dama de la Pizarra', year: '2025', tech: 'Acrílico sobre relieve de pizarra', img: '/assets/608211438_1562089535270462_2827127275272133326_n.webp' }
];
