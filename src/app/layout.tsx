import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Caveat } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const caveat = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://naroagutierrezgil.com'),
  title: {
    default: "N A R O A | Fine Art & Hiperrealismo POP",
    template: "%s | N A R O A"
  },
  description: "Portafolio oficial de Naroa Gutiérrez Gil. Artista visual especializada en hiperrealismo pop y acrílico sobre pizarra. Bilbao.",
  keywords: ["Naroa Gutierrez Gil", "Hiperrealismo", "Arte Pop", "Acrílico sobre pizarra", "Artista Bilbao", "Pintura hiperrealista", "Retratos por encargo"],
  authors: [{ name: "Naroa Gutiérrez Gil" }],
  creator: "Naroa Gutiérrez Gil",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://naroagutierrezgil.com",
    title: "N A R O A | Fine Art & Hiperrealismo POP",
    description: "Portafolio oficial de Naroa Gutiérrez Gil. Arte visual en pizarra.",
    siteName: "N A R O A",
    images: [{
      url: "https://naroa.online/assets/hq-james-CjsTrO7r.webp",
      width: 1200,
      height: 630,
      alt: "Naroa Gutiérrez Gil - Universo Artístico"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "N A R O A | Fine Art & Hiperrealismo POP",
    description: "Portafolio oficial de Naroa Gutiérrez Gil.",
    images: ["https://naroa.online/assets/hq-james-CjsTrO7r.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import SmoothScroll from "@/components/SmoothScroll";
import SOTAFX from "@/components/SOTAFX";
import Curtain from "@/components/Curtain";
import PaintTrail from "@/components/PaintTrail";
import DepthHUD from "@/components/DepthHUD";
import SecretEgg from "@/components/SecretEgg";
import Mica from "@/components/Mica";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${cormorant.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans bg-slate-texture">
        <SecretEgg />
        <PaintTrail />
        <Curtain />
        <SOTAFX />
        <DepthHUD />
        <Mica />
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
