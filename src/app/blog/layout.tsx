import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bitácora | Naroa Gutiérrez Gil',
  description: 'Apuntes de pintura, crónicas de exposiciones y reflexiones matéricas desde Bilbao. El archivo y diario de la artivista visual Naroa Gutiérrez Gil.',
  openGraph: {
    title: 'Bitácora — Naroa Gutiérrez Gil',
    description: 'Diario artístico, crónicas de exposiciones y kintsugi pedagógico en el País Vasco.',
    images: [{ url: '/assets/615932964_1577822457030503_2110397705300850911_n.webp', width: 1200, height: 630 }],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
