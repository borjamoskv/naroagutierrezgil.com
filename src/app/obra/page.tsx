import type { Metadata } from 'next';
import ObraClient from './ObraClient';

export const metadata: Metadata = {
  title: 'Catálogo de Obra | Naroa Gutiérrez Gil',
  description: 'Explora el catálogo de obras contemporáneas, retratos pop, pizarra centenaria de tejado vasco, Kintsugi accidental y técnica mixta de Naroa Gutiérrez Gil.',
  openGraph: {
    title: 'Catálogo de Obra | Naroa Gutiérrez Gil',
    description: 'Galería interactiva y catálogo de obras en pizarra, acrílico, mica mineral y Kintsugi.',
    url: 'https://naroagutierrezgil.com/obra',
  },
};

export default function ObraPage() {
  return <ObraClient />;
}
