import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Autodidacta | Experiencia Inmersiva',
  description: 'Explora el viaje autodidacta de Naroa Gutiérrez Gil: pizarra, kintsugi accidental y pedagogía del caos. Una experiencia web interactiva con sintetizador de sonido en tiempo real.',
  openGraph: {
    title: 'Autodidacta — Naroa Gutiérrez Gil',
    description: 'Experiencia inmersiva: interactúa con la pizarra, graba grietas de oro y modula el sintetizador en tiempo real.',
    images: [{ url: '/assets/celia-cruz-cantinflowers-DO-SRKMB.webp', width: 1200, height: 630 }],
  },
};

export default function AutodidactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
