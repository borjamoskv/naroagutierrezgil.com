import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Biografía | Naroa Gutiérrez Gil',
  description: 'Trayectoria completa de Naroa Gutiérrez Gil. Desde sus inicios en 2010 con Espejos del Alma hasta DiviNos VaiVenes y Bwall Collective en 2026. Artivista visual bilbaína.',
  openGraph: {
    title: 'Biografía — Naroa Gutiérrez Gil',
    description: 'Trayectoria, técnica matérica y redes colaborativas de la artivista visual.',
    images: [{ url: '/assets/Naroa x16.webp', width: 1200, height: 630 }],
  },
};

export default function BiografiaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
