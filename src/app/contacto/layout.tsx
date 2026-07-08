import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto | Solicitar Encargo',
  description: 'Configura tu encargo personalizado de retrato sobre pizarra natural. Calcula el presupuesto en tiempo real según tipo, tamaño y técnica.',
  openGraph: {
    title: 'Contacto — Naroa Gutiérrez Gil',
    description: 'Solicita un retrato personalizado sobre pizarra natural con estimación de inversión en tiempo real.',
  },
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
