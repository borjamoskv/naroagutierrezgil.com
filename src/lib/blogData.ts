export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
  content: string;
  image: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "bwall-collective-dock",
    title: "Bwall Collective en el Dock: brotes de alma y manos",
    date: "01/06/2026",
    category: "Exposiciones",
    tags: ["Colectiva", "Dock Bilbao", "Feminismo", "Olatz Arrese"],
    excerpt: "Nuevas sinergias y colisiones artísticas de tinte femenino en Dock Bilbao. Siete creadoras visuales germinan muros con arte y ritmo de vinilo.",
    content: "Nuevas sinergias y colisiones artísticas de tinte femenino en Dock Bilbao. Siete creadoras visuales germinan muros con arte y ritmo de vinilo. Esta muestra es un reflejo del poder colectivo y de la capacidad transformadora del arte cuando se crea en red y desde lo colaborativo.",
    image: "https://naroagutierrez.wordpress.com/wp-content/uploads/2026/05/whatsapp-image-2026-05-27-at-15.00.32.jpeg?w=800"
  },
  {
    slug: "autorretratos-mujeres-espejo",
    title: "Autorretratos: Mujeres a través del Espejo",
    date: "14/05/2026",
    category: "Talleres",
    tags: ["Marienea", "Identidad", "Autorretrato", "Sanación"],
    excerpt: "Un viaje íntimo frente al espejo gestado en Marienea (Basauri). Un ramillete de mujeres valientes indaga en su propia identidad plasmando sus almas en libretas.",
    content: "Un viaje íntimo frente al espejo gestado en Marienea (Basauri). Un ramillete de mujeres valientes indaga en su propia identidad plasmando sus almas en libretas. El taller consistió en sesiones de introspección profunda donde el acto de pintarse a sí mismas se transformó en un vehículo de liberación y descubrimiento.",
    image: "https://naroagutierrez.wordpress.com/wp-content/uploads/2026/05/autorretratos-marienea-png.png?w=800"
  },
  {
    slug: "divinos-vaivenes-politena",
    title: "Muestra «DiviNos VaiVenes» en Politena",
    date: "15/01/2026",
    category: "Exposiciones",
    tags: ["Individual", "Politena", "Pizarra", "Pop"],
    excerpt: "Selección de retratos pop sobre pizarra y soportes recuperados en el espacio Politena de Bilbao. Un recorrido por miradas intensas y relieves lágricos.",
    content: "Selección de retratos pop sobre pizarra y soportes recuperados en el espacio Politena de Bilbao. Un recorrido por miradas intensas y relieves lágricos. En esta serie, la pizarra actúa como metáfora de la memoria, donde los rostros femeninos se desdibujan y se reafirman a través del contraste matérico.",
    image: "https://naroagutierrez.wordpress.com/wp-content/uploads/2026/01/6-foto-100-auto.jpg?w=800"
  },
  {
    slug: "azoka-en-lataska-sopela",
    title: "Azoka en Lataska, Sopela",
    date: "22/05/2025",
    category: "Encuentros",
    tags: ["Sopela", "Lataska", "Feria", "Artesanía"],
    excerpt: "Domingos de arte con aroma costero y sabor a hogar. Piezas únicas sobre pizarra, láminas Fine Art y encuentro matérico junto al mar.",
    content: "Domingos de arte con aroma costero y sabor a hogar. Piezas únicas sobre pizarra, láminas Fine Art y encuentro matérico junto al mar. Una oportunidad para sacar el arte del circuito cerrado de las galerías y llevarlo al espacio cotidiano y compartido de la costa bizkaina.",
    image: "https://naroagutierrez.wordpress.com/wp-content/uploads/2025/05/0-aazoka-en-lataska.png?w=800"
  },
  {
    slug: "udaberriko-jaia-2025-market",
    title: "Udaberriko Jaia 2025: Market en Sopelana",
    date: "09/05/2025",
    category: "Encuentros",
    tags: ["Sopela", "Market", "Primavera", "Diseño"],
    excerpt: "Celebrando la llegada del buen tiempo en Uribe Kosta. Una exhibición al aire libre de piezas limitadas y obras en técnica mixta.",
    content: "Celebrando la llegada del buen tiempo en Uribe Kosta. Una exhibición al aire libre de piezas limitadas y obras en técnica mixta. El encuentro permitió acercar procesos de taller a pie de calle, mostrando la alquimia de los materiales en un entorno vivo.",
    image: "https://naroagutierrez.wordpress.com/wp-content/uploads/2026/05/gif-olatz-flores-para-gif.gif"
  },
  {
    slug: "el-recreo-espacio-creacion",
    title: "El ReCreo: Espacio de Creación para recreArte",
    date: "12/01/2024",
    category: "Talleres",
    tags: ["Formación", "Yo Pinto Mucho", "Kintsugi Pedagógico", "Libre"],
    excerpt: "Nace un refugio de acompañamiento creativo libre en Uribarri. Un espacio multigeneracional para jugar con la pintura y revalorizar el error.",
    content: "Nace un refugio de acompañamiento creativo libre en Uribarri. Un espacio multigeneracional para jugar con la pintura y revalorizar el error. Inspirado en el kintsugi pedagógico, El ReCreo no busca la obra perfecta, sino el proceso de reparación emocional a través de la mancha y el gesto plástico.",
    image: "https://naroagutierrez.wordpress.com/wp-content/uploads/2024/01/el-recreo5.jpg?w=800"
  },
  {
    slug: "muestra-colectiva-emakumeen-artean",
    title: "Muestra Colectiva «Emakumeen arteaN»",
    date: "16/12/2022",
    category: "Exposiciones",
    tags: ["Feminismo", "Colectiva", "Uribarri", "Mujeres Artistas"],
    excerpt: "Encuentro y visibilización de creadoras locales en el corazón de Bilbao. Una muestra que celebra el poder colectivo del arte femenino.",
    content: "Encuentro y visibilización de creadoras locales en el corazón de Bilbao. Una muestra que celebra el poder colectivo del arte femenino. Diversas técnicas y miradas se entrelazan para tejer una red de resistencia poética frente a la invisibilidad institucional.",
    image: "https://naroagutierrez.wordpress.com/wp-content/uploads/2026/05/foto-grupo-ok.png?w=800"
  },
  {
    slug: "repoker-reinas-vaivenes-siarte",
    title: "Repóker de Reinas: VAIVENES en Siarte",
    date: "22/03/2022",
    category: "Exposiciones",
    tags: ["Siarte", "Pop", "Espejo", "Retratos"],
    excerpt: "Cinco reinas y cinco miradas pop cargadas de turbulencias internas. Retratos en tensión que desafían los moldes y los reflejos del alma.",
    content: "Cinco reinas y cinco miradas pop cargadas de turbulencias internas. Retratos en tensión que desafían los moldes y los reflejos del alma. Las piezas cuestionan los roles heredados de la realeza simbólica mediante colores saturados y trazos descarnados.",
    image: "https://naroagutierrez.wordpress.com/wp-content/uploads/2026/05/gif-2022.gif"
  }
];
