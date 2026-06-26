export interface Artwork {
  title: string;
  year: string;
  tech: string;
  img: string;
}

export const allArtworks: Artwork[] = [
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
