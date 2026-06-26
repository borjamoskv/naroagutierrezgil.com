import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contacto | Naroa Gutiérrez Gil",
  description: "Formulario de inscripción para adquisición de obras e información del estudio.",
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
