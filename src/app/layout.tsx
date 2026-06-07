import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

import CustomCursor from "@/components/CustomCursor";
import Soundscape from "@/components/Soundscape";
import Preloader from "@/components/Preloader";
import AgentWidget from "@/components/AgentWidget";

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
    <html lang="es" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${outfit.variable} ${jetbrainsMono.variable} bg-[#0A0A0A] text-[#EAEAEA] antialiased`}>
        <Preloader />
        <CustomCursor />
        <Soundscape />
        {children}
        <AgentWidget />
      </body>
    </html>
  );
}
