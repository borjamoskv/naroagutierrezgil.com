const fs = require('fs');
const path = require('path');

const newArtworks = [
  {
    id: 28,
    slug: 'infusion-de-berto',
    url: '/assets/infusion-de-berto.webp',
    title: 'Infusión de Berto',
    href: '#obra-infusion-de-berto',
    year: '2024',
    medium: 'Técnica Mixta y Romero Seco sobre Rodaja de Madera',
    description: 'Retrato expresionista de Berto Romero interviniendo la textura orgánica de la madera con una bolsita de infusión de romero real.',
    sizeCategory: 'medium'
  },
  {
    id: 29,
    slug: 'vale-o-no-buenafuente',
    url: '/assets/vale-o-no-buenafuente.webp',
    title: '¿Vale o No? (Andreu Buenafuente)',
    href: '#obra-vale-o-no-buenafuente',
    year: '2024',
    medium: 'Acrílico, Posca y Tenedor de Plástico sobre Plato de Madera',
    description: 'Homenaje humorístico e icónico a Andreu Buenafuente sobre plato artesanal de madera con collage tipográfico y tenedor azul.',
    sizeCategory: 'medium'
  },
  {
    id: 30,
    slug: 'agassi-out',
    url: '/assets/agassi-out.webp',
    title: 'Agassi: OUT',
    href: '#obra-agassi-out',
    year: '2023',
    medium: 'Técnica Mixta, Hilo, Papel Rasgado y Pelota sobre Lienzo',
    description: 'Retrato de perfil de Andre Agassi con cinta neón, red de tenis en relieve e intervención textil visceral.',
    sizeCategory: 'large'
  },
  {
    id: 31,
    slug: 'audrey-frutas',
    url: '/assets/audrey-frutas.webp',
    title: 'Audrey & Pegatinas de Fruta',
    href: '#obra-audrey-frutas',
    year: '2023',
    medium: 'Grafito, Sombrero de Musgo y Collage de Etiquetas de Frutas',
    description: 'Audrey Hepburn estilizada con sombrero verde de textura vegetal, pestaña solar neón y collar de pegatinas frutales.',
    sizeCategory: 'medium'
  },
  {
    id: 32,
    slug: 'camaron-de-la-isla',
    url: '/assets/camaron.webp',
    title: 'Camarón de la Isla',
    href: '#obra-camaron-de-la-isla',
    year: '2023',
    medium: 'Grafito Intenso sobre Tela Papel y Borde de Topos',
    description: 'La mirada mítica y profunda de Camarón de la Isla con chaqueta de cuero y marco textil de lunares flamencos.',
    sizeCategory: 'large'
  },
  {
    id: 33,
    slug: 'rosetta-tharpe',
    url: '/assets/rosetta-tharpe.webp',
    title: 'Sister Rosetta Tharpe',
    href: '#obra-rosetta-tharpe',
    year: '2023',
    medium: 'Acrílico & Collage sobre Soporte Mixto',
    description: 'Homenaje a la madre del Rock and Roll con guitarra, fuerza escénica y vibración de color neón.',
    sizeCategory: 'medium'
  },
  {
    id: 34,
    slug: 'cantinflas-mexicano',
    url: '/assets/cantinflas-mexicano.webp',
    title: 'Cantinflas: El Sombrerito',
    href: '#obra-cantinflas-mexicano',
    year: '2024',
    medium: 'Grafito y Acrílico Neón con Cigarro Encendido',
    description: 'Retrato en blanco y negro de Cantinflas con cigarrillo humeante y fondo desbordante de peces y flora mexicana.',
    sizeCategory: 'large'
  },
  {
    id: 35,
    slug: 'cantinflas-barroco',
    url: '/assets/cantinflas-barroco.webp',
    title: 'Cantinflas Barroco',
    href: '#obra-cantinflas-barroco',
    year: '2024',
    medium: 'Óleo sobre Lienzo con Corbata de Lunares y Marco Dorado',
    description: 'Retrato elegante y atemporal de Mario Moreno "Cantinflas" enmarcado en moldura barroca dorada de pan de oro.',
    sizeCategory: 'medium'
  },
  {
    id: 36,
    slug: 'diva-tartan',
    url: '/assets/diva-tartan.webp',
    title: 'Diva Tartán y Plumas',
    href: '#obra-diva-tartan',
    year: '2023',
    medium: 'Grafito, Tela de Escocés Tartán, Encaje y Plumas Negras',
    description: 'Retrato expresivo tridimensional combinando encaje victoriano, bordados de pedrería y plumas de avestruz.',
    sizeCategory: 'large'
  },
  {
    id: 37,
    slug: 'ojo-magico',
    url: '/assets/ojo-magico.webp',
    title: 'Ojo Mágico & Misticismo',
    href: '#obra-ojo-magico',
    year: '2023',
    medium: 'Óleo sobre Fondo Negro con Cáncamo Metálico y Rosa',
    description: 'Composición figurativa surrealista con ojo místico en relieve, lágrima de bronce y flor mística.',
    sizeCategory: 'small'
  },
  {
    id: 38,
    slug: 'bowie-space-oddity',
    url: '/assets/bowie-space-oddity.webp',
    title: 'Bowie: El Hombre que Susurraba a las Estrellas',
    href: '#obra-bowie-space-oddity',
    year: '2022',
    medium: 'Grafito, Rayo Neón y Estrellas de Aluminio en Relieve',
    description: 'David Bowie haciendo el gesto del silencio ante una tormenta cosmológica de estrellas troqueladas en relieve.',
    sizeCategory: 'colossal'
  },
  {
    id: 39,
    slug: 'bebe-cochecitos',
    url: '/assets/bebe-cochecitos.webp',
    title: 'Infancia Neón',
    href: '#obra-bebe-cochecitos',
    year: '2023',
    medium: 'Acrílico Multicolor y Trazo Expresionista sobre Papel',
    description: 'Retrato infantil lleno de vitalidad y capas de color neón con dinamismo expresivo.',
    sizeCategory: 'medium'
  },
  {
    id: 40,
    slug: 'cajita-mujer-sombrero',
    url: '/assets/cajita-mujer-sombrero.webp',
    title: 'En.Caja: Dama de Verde',
    href: '#obra-cajita-mujer-sombrero',
    year: '2023',
    medium: 'Pintura y Sombrero de Tela sobre Caja de Madera',
    description: 'Perfil de mujer con pamela de encaje negro sobre veta de madera tratada en verde botánico.',
    sizeCategory: 'small'
  },
  {
    id: 41,
    slug: 'guerrero-bandana',
    url: '/assets/guerrero-bandana.webp',
    title: 'Pero Una Gran Vida Social',
    href: '#obra-guerrero-bandana',
    year: '2022',
    medium: 'Acrílico Neón, Collage de Entradas de Concierto y Posca',
    description: 'Retrato sonriente de mujer con pañuelo formado por recortes de entradas de salas míticas (El Sol, Granada Club).',
    sizeCategory: 'large'
  },
  {
    id: 42,
    slug: 'retrato-rizos-pulseras',
    url: '/assets/retrato-rizos-pulseras.webp',
    title: 'Rizos & Pulseras de Color',
    href: '#obra-retrato-rizos-pulseras',
    year: '2023',
    medium: 'Grafito y Toques Neón sobre Papel de Grano Fino',
    description: 'Estudio hiperrealista de cabello rizado y mirada cálida con detalles neón en muñeca y vestido.',
    sizeCategory: 'medium'
  },
  {
    id: 43,
    slug: 'naroa-con-perro',
    url: '/assets/naroa-con-perro.webp',
    title: 'Cómplices: Naroa y su Yorkie',
    href: '#obra-naroa-con-perro',
    year: '2024',
    medium: 'Retrato de Estudio & Obra Original en Enmarcado',
    description: 'Fotografía procesada y retrato intervenido de la artista con su compañero canino.',
    sizeCategory: 'medium'
  },
  {
    id: 44,
    slug: 'retrato-splash',
    url: '/assets/retrato-splash.webp',
    title: 'Mirada en Trazos',
    href: '#obra-retrato-splash',
    year: '2023',
    medium: 'Grafito e Ilustración Digital con Trazo Gestual',
    description: 'Retrato masculino de mirada serena rodeado de estallidos de ceras de colores.',
    sizeCategory: 'medium'
  },
  {
    id: 45,
    slug: 'retrato-pink',
    url: '/assets/retrato-pink.webp',
    title: 'Espiral Rosa',
    href: '#obra-retrato-pink',
    year: '2023',
    medium: 'Óleo y Acrílico sobre Fondo Magenta',
    description: 'Retrato masculino de intenso dramatismo con corbata roja e icónica espiral de humo rosa.',
    sizeCategory: 'medium'
  },
  {
    id: 46,
    slug: 'pareja-bn',
    url: '/assets/pareja-bn.webp',
    title: 'Amor en Blanco y Negro',
    href: '#obra-pareja-bn',
    year: '2023',
    medium: 'Óleo en Grisalla sobre Lienzo',
    description: 'Retrato doble de pareja por encargo con riqueza de texturas y sonrisas de complicidad.',
    sizeCategory: 'large'
  },
  {
    id: 47,
    slug: 'retrato-piedra',
    url: '/assets/retrato-piedra.webp',
    title: 'Mirada en Piedra y Mineral',
    href: '#obra-retrato-piedra',
    year: '2023',
    medium: 'Pigmentos y Grafito sobre Fragmento de Losa Natural',
    description: 'Expresión poética integrada en la morfología irregular del soporte pétreo.',
    sizeCategory: 'small'
  },
  {
    id: 48,
    slug: 'retrato-nina-explosivo',
    url: '/assets/retrato-nina-explosivo.webp',
    title: 'Inocencia Neón',
    href: '#obra-retrato-nina-explosivo',
    year: '2023',
    medium: 'Grafito y Acrílico Gestual sobre Papel',
    description: 'Retrato de niña rodeado de ráfagas vibrantes de acrílico amarillo y magenta.',
    sizeCategory: 'medium'
  },
  {
    id: 49,
    slug: 'retrato-dorado',
    url: '/assets/retrato-dorado.webp',
    title: 'Dama con Encaje Dorado',
    href: '#obra-retrato-dorado',
    year: '2023',
    medium: 'Grafito, Pan de Oro y Collage Troquelado',
    description: 'Retrato elegante sobre fondo calado dorado de intrincado encaje artesanal.',
    sizeCategory: 'large'
  },
  {
    id: 50,
    slug: 'do-they-match',
    url: '/assets/do-they-match.webp',
    title: 'Do They Match?',
    href: '#obra-do-they-match',
    year: '2023',
    medium: 'Técnica Mixta, Papel Cortado y Redes sobre Lienzo',
    description: 'Estudio de retrato pop sobre rasgado de papel y red textil con interrogante conceptual.',
    sizeCategory: 'large'
  }
];

console.log('New artworks to append:', newArtworks.length);
