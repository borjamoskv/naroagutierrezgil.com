import type { Metadata } from "next";
import "./globals.css";

import CustomCursor from "@/components/CustomCursor";
import Preloader from "@/components/Preloader";

export const metadata: Metadata = {
  metadataBase: new URL('https://naroagutierrezgil.com'),
  title: {
    default: "Naroa Gutiérrez Gil | Artivista",
    template: "%s | Naroa Gutiérrez Gil"
  },
  description: "Portafolio Oficial. Retratos hiperrealistas pop, técnica mixta y texturas termodinámicas en pizarra de la artista visual Naroa Gutiérrez Gil.",
  keywords: ["Arte Contemporáneo", "Hiperrealismo Pop", "Kintsugi Digital", "Pizarra Vasca", "Naroa Gutiérrez Gil", "Exposición de Arte 2026"],
  authors: [{ name: "Naroa Gutiérrez Gil" }],
  creator: "Borja Moskv",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://naroagutierrezgil.com",
    title: "Naroa Gutiérrez Gil | Cimientos de Pizarra",
    description: "Una experiencia inmersiva WebGL. Retratos pop en técnica mixta y alquimia visual.",
    siteName: "Naroa Gutiérrez Gil Oficial",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Naroa Gutiérrez Gil - Obra en Pizarra",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Naroa Gutiérrez Gil | Arte y Termodinámica",
    description: "Portafolio Oficial Interactivo 2026.",
    images: ["/og-image.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "VisualArtwork",
  "name": "Portafolio Oficial Naroa Gutiérrez Gil",
  "creator": [
    {
      "@type": "Person",
      "name": "Naroa Gutiérrez Gil",
      "jobTitle": "Artista Visual"
    }
  ],
  "description": "Galería inmersiva y archivo de obras en técnica mixta sobre pizarra.",
  "artMedium": "Acrílico sobre pizarra, Kintsugi, Arte Digital"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=JetBrains+Mono:wght@100..800&family=Outfit:wght@100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Space+Grotesk:wght@300..700&family=Syne:wght@400..800&family=Unbounded:wght@200..900&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Primitive 44: Speculation Rules API for instant 0ms transitions. Creator: borjamoskv */}
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              prerender: [
                {
                  source: "list",
                  urls: ["/", "/autodidact", "/biografia", "/contacto", "/test-physics", "/splat-benchmark"],
                  eagerness: "moderate"
                }
              ]
            })
          }}
        />
      </head>
      <body className="bg-[#0A0A0A] text-[#EAEAEA] antialiased">
        <Preloader />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
