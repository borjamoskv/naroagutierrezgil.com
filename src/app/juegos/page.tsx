import type { Metadata } from 'next';
import JuegosClient from './JuegosClient';

export const metadata: Metadata = {
  title: 'Juegos Interactivos | La Sala de Juegos de Naroa',
  description: 'Explora la Sala de Juegos interactivos de Naroa Gutiérrez Gil: El Restaurador Desastroso, La Oca de las Artes y El Espejo de Aaron.',
  openGraph: {
    title: 'Juegos Interactivos | Naroa Gutiérrez Gil',
    description: 'Minijuegos interactivos de arte contemporáneo, Kintsugi digital y restauración de pizarra.',
    url: 'https://naroagutierrezgil.com/juegos',
  },
};

export default function JuegosPage() {
  return <JuegosClient />;
}
