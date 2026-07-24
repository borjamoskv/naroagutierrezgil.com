import type { Metadata } from "next";
import "./globals.css";

import ClientWrapper from "@/components/ClientWrapper";

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
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&display=swap" as="style" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Outfit:wght@200;300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#2B3BE5" />
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
                  urls: ["/", "/obra", "/juegos", "/shop", "/autodidact", "/biografia", "/contacto", "/blog"],
                  eagerness: "moderate"
                }
              ]
            })
          }}
        />
      </head>
      <body className="bg-[#0A0A0A] text-[#EAEAEA] antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999] focus:bg-[#2B3BE5] focus:text-white focus:px-4 focus:py-2 focus:text-sm focus:rounded-sm">Saltar al contenido</a>
        <ClientWrapper />
        {children}
        {/* Cloudflare Web Analytics (Zero-Entropy Telemetry) */}
        <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "REPLACE_WITH_YOUR_CF_TOKEN"}'></script>
      </body>
    </html>
  );
}
