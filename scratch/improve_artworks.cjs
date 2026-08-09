const fs = require('fs');

const artworksFile = 'src/artworks.ts';
let content = fs.readFileSync(artworksFile, 'utf-8');

const replacements = [
  { slug: 'agassi-out', title: 'Agassi Out', desc: 'Retrato hiperrealista con textura vibrante y actitud desafiante.' },
  { slug: 'audrey-frutas', title: 'Audrey Frutas', desc: 'La elegancia clásica de Audrey contrastada con motivos frutales coloridos.' },
  { slug: 'bebe-cochecitos', title: 'Bebé Cochecitos', desc: 'Obra pop figurativa que evoca nostalgia infantil y juego cotidiano.' },
  { slug: 'bowie-space-oddity', title: 'Bowie Space Oddity', desc: 'Tributo interestelar al Duque Blanco, fusionando realismo y fantasía cósmica.' },
  { slug: 'cajita-mujer-sombrero-2', title: 'Cajita Mujer Sombrero II', desc: 'Micro-universo atrapado en una lata de conserva con elegancia vintage.' },
  { slug: 'cajita-mujer-sombrero', title: 'Cajita Mujer Sombrero', desc: 'Escultura en formato pequeño que encierra nostalgia y belleza clásica.' },
  { slug: 'cajita-roja-cerrada', title: 'Cajita Roja Cerrada', desc: 'Composición misteriosa y contenida dentro de la serie En.lata.' },
  { slug: 'camaron', title: 'Camarón', desc: 'El duende y la intensidad del cante flamenco capturados en trazo profundo.' },
  { slug: 'cantinflas-barroco', title: 'Cantinflas Barroco', desc: 'Sátira exquisita que viste a la leyenda del humor con ropajes renacentistas.' },
  { slug: 'cantinflas-mexicano', title: 'Cantinflas Mexicano', desc: 'Homenaje vibrante a las raíces y al genio cómico, envuelto en colores tradicionales.' },
  { slug: 'diva-tartan', title: 'Diva Tartan', desc: 'Fusión de actitud punk y elegancia clásica bajo un patrón escocés audaz.' },
  { slug: 'do-they-match', title: 'Do They Match', desc: 'Cuestionamiento visual sobre la dualidad y la armonía estética en clave pop.' },
  { slug: 'expo-artistas-emergentes', title: 'Artistas Emergentes', desc: 'Capturando el pulso del talento contemporáneo y la efervescencia creativa.' },
  { slug: 'expo-bilbao-art-market', title: 'Bilbao Art Market', desc: 'Reflejo del dinamismo cultural y la conexión directa con el espectador.' },
  { slug: 'expo-divinos-vaivenes', title: 'Divinos Vaivenes', desc: 'Exploración de la fragilidad, el movimiento de la identidad y el mito.' },
  { slug: 'expo-espejos-alma', title: 'Espejos del Alma', desc: 'Introspección hiperrealista que invita a perderse en miradas ajenas.' },
  { slug: 'expo-facefood-plentzia', title: 'Facefood Plentzia', desc: 'Serie que mezcla iconografía gastronómica con retrato de alta expresividad.' },
  { slug: 'expo-identity-fragments', title: 'Identity Fragments', desc: 'Desconstrucción del yo a través de trazos viscerales y geometría fragmentada.' },
  { slug: 'expo-mujeres-creadoras', title: 'Mujeres Creadoras', desc: 'Homenaje a la fuerza creativa femenina, con texturas cálidas y contundentes.' },
  { slug: 'expo-repoker-reinas', title: 'Repóker de Reinas', desc: 'Empoderamiento y realeza pop encapsulados en figuras icónicas atemporales.' },
  { slug: 'guerrero-bandana', title: 'Guerrero Bandana', desc: 'Actitud urbana y fuerza contenida en un retrato de mirada penetrante.' },
  { slug: 'hacer_el_indio_1783824336337', title: 'Hacer el Indio', desc: 'Explosión de color y texturas que reivindica el espíritu lúdico y salvaje.' },
  { slug: 'la_famiglia_1783824320607', title: 'La Famiglia', desc: 'Composición íntima y nostálgica que explora los lazos y el afecto.' },
  { slug: 'naroa-con-perro', title: 'Naroa con Perro', desc: 'Autorretrato lleno de ternura y complicidad bañado por una luz intimista.' },
  { slug: 'naroa-facepaint-cuadro', title: 'Facepaint (Cuadro)', desc: 'Experimentación cromática sobre el propio rostro, desdibujando la línea del lienzo.' },
  { slug: 'naroa-facepaint-tumbada', title: 'Facepaint (Tumbada)', desc: 'Perspectiva inusual y colores saturados en un ejercicio de autoexploración.' },
  { slug: 'ojo-magico', title: 'Ojo Mágico', desc: 'Detalle macro hiperrealista donde el iris se convierte en un universo lumínico.' },
  { slug: 'pareja-bn', title: 'Pareja en Blanco y Negro', desc: 'Contraste dramático para capturar la intimidad y la conexión de dos almas.' },
  { slug: 'retrato-dorado', title: 'Retrato Dorado', desc: 'Rostro iluminado por acentos metálicos, evocando misticismo y divinidad terrenal.' },
  { slug: 'retrato-nina-explosivo', title: 'Niña Explosivo', desc: 'La inocencia fracturada por salpicaduras vibrantes y energía pictórica.' },
  { slug: 'retrato-piedra', title: 'Retrato Piedra', desc: 'Texturas rugosas y paleta fría que esculpen un rostro de aparente inmutabilidad.' },
  { slug: 'retrato-pink', title: 'Retrato Pink', desc: 'Neón y flúor abrazan una mirada penetrante en este retrato puramente expresionista.' },
  { slug: 'retrato-rizos-pulseras', title: 'Rizos y Pulseras', desc: 'Costumbrismo contemporáneo con atención hiperrealista a los pequeños detalles.' },
  { slug: 'retrato-splash', title: 'Retrato Splash', desc: 'Dinamismo puro donde la pintura parece seguir en constante movimiento.' },
  { slug: 'rosetta-tharpe', title: 'Rosetta Tharpe', desc: 'Homenaje a la pionera del rock \'n\' roll con trazos eléctricos y llenos de soul.' },
];

replacements.forEach(r => {
  const regex = new RegExp(`(slug:\\s*'${r.slug}',\\s*url:.*?,\\s*)title:\\s*'.*?',(\\s*href:.*?,\\s*year:\\s*'.*?',\\s*medium:\\s*'.*?',\\s*)description:\\s*'.*?'(,\\s*sizeCategory:\\s*'.*?')`, 'gs');
  content = content.replace(regex, `$1title: '${r.title}',$2description: '${r.desc.replace(/'/g, "\\'")}'$3`);
});

fs.writeFileSync(artworksFile, content);
console.log('Artworks improved successfully!');
