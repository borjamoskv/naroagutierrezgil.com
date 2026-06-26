export type AlcoveId = 'pop' | 'pizarra' | 'poliester' | 'kintsugi' | 'mica' | 'reverso';

export interface AlcoveData {
  universeNum: string;
  title: string;
  description: string;
  material: string;
  friction: string;
  image: string;
}

export const alcoveTabs = [
  { id: 'pop', num: 'I', label: 'El Retrato Pop' },
  { id: 'pizarra', num: 'II', label: 'Pizarra Centenaria' },
  { id: 'poliester', num: 'III', label: 'Poliéster Translúcido' },
  { id: 'kintsugi', num: 'IV', label: 'Kintsugi Accidental' },
  { id: 'mica', num: 'V', label: 'Mica & Cerámica' },
  { id: 'reverso', num: 'VI', label: 'El Reverso Acústico' },
] as const;

export const alcoveData: Record<AlcoveId, AlcoveData> = {
  pop: {
    universeNum: 'I',
    title: 'El Retrato Pop Monumental',
    description: 'La cara no es una similitud física; es una máscara emocional. Rostros icónicos del cine y de la música se plasman sobre un soporte indómito, logrando una confrontación de alta fidelidad entre la saturación del acrílico y la aspereza del basalto.',
    material: 'Acrílico & Basalto',
    friction: 'Grosor 2cm a 4cm',
    image: 'james-new.webp',
  },
  pizarra: {
    universeNum: 'II',
    title: 'La Pizarra de Tejado Vasco',
    description: 'Material recuperado directamente de derribos de tejados tradicionales en Bilbao. Sometidas a cortes geográficos, sellado con resina epoxi de brillo espejo y rematadas con bordes rotos, las pizarras representan el concepto de refugio, hogar y dureza ancestral.',
    material: 'Pizarra Vasco-Lítica',
    friction: 'Corte Rústico Manual',
    image: '601340023_1552126202933462_7815927344957967258_n.webp',
  },
  poliester: {
    universeNum: 'III',
    title: 'El Papel Poliéster Translúcido',
    description: 'Un laboratorio químico de tintas diluidas con agua de colonia. Los trazos disueltos sobre poliéster translúcido crean siluetas orgánicas flotantes, semejantes a radiografías de huesos o fluidos en tensión lumínica.',
    material: 'Tinta y Poliéster',
    friction: 'Sin Fricción (Líquido)',
    image: '612329591_1571120784367337_8798688892093004057_n.webp',
  },
  kintsugi: {
    universeNum: 'IV',
    title: 'Kintsugi Accidental & Costras',
    description: 'Nacido por un error en pandemia mezclando cola blanca barata y acrílico. La costra del lienzo se resquebraja al secarse. En lugar de descartarlo, la artista raspa la herida y la rellena con barnices de oro, transformando la falla física en una veta de luz.',
    material: 'Cola, Acrílico & Oro',
    friction: 'Fractura Termodinámica',
    image: 'lagrimas-de-oro-DikHc-Tk.webp',
  },
  mica: {
    universeNum: 'V',
    title: 'La Mica Mineral y los Ojos de Cristal',
    description: 'Escamas de mica mineral encoladas que reflejan destellos aleatorios según el punto de vista del espectador. Se complementa con las pupilas del retrato, pintadas en capas cerámicas 3D aplicadas con palillo de dientes para lograr un relieve ocular realista.',
    material: 'Mica, Barniz de Vidrio',
    friction: 'Escamas Cristalizadas',
    image: 'el-gran-dakari-C1tAWAhR.webp',
  },
  reverso: {
    universeNum: 'VI',
    title: 'El Reverso del Lienzo y la Acústica',
    description: 'El lienzo físico guarda secretos en su reverso: cartas escritas por el retratado, códigos QR que reproducen el paisaje acústico electrónico compuesto especialmente por el productor Borja Moskv, y el alter ego masculino "Aaron".',
    material: 'QR & Ledger Criptográfico',
    friction: 'Flujo Dual Reverso',
    image: 'naroa-portrait-new.webp',
  },
};
