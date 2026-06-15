import type { Metadata } from "next";
import { Outfit, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: 'swap' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://naroagutierrezgil.com'),
  title: {
    default: "Naroa Gutiérrez Gil | Artista",
    template: "%s | Naroa Gutiérrez Gil"
  },
  description: "Portafolio oficial. Retratos hiperrealistas en pizarra natural. Arte contemporáneo.",
  keywords: ["Arte Contemporáneo", "Hiperrealismo", "Kintsugi", "Pizarra", "Naroa Gutiérrez Gil"],
  authors: [{ name: "Naroa Gutiérrez Gil" }],
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://naroagutierrezgil.com",
    title: "Naroa Gutiérrez Gil",
    description: "Arte sobre pizarra natural. Retratos hiperrealistas y Kintsugi.",
    siteName: "Naroa Gutiérrez Gil",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Naroa Gutiérrez Gil - Arte en Pizarra",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Naroa Gutiérrez Gil",
    description: "Arte sobre pizarra natural.",
    images: ["/og-image.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "name": "Naroa Gutiérrez Gil",
      "url": "https://naroagutierrezgil.com",
      "description": "Galería inmersiva. Arte sobre pizarra natural."
    },
    {
      "@type": "Person",
      "name": "Naroa Gutiérrez Gil",
      "jobTitle": "Artista Visual",
      "url": "https://naroagutierrezgil.com"
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${outfit.variable} ${jetbrainsMono.variable} ${playfair.variable} bg-[#020202] text-white antialiased overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}