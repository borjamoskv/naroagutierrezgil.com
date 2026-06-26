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
