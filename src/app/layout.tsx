import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import CustomCursorWrapper from "@/components/CustomCursorWrapper";

export const metadata: Metadata = {
  metadataBase: new URL('https://naroagutierrezgil.com'),
  title: {
    default: "Naroa Gutiérrez Gil",
    template: "%s | Naroa Gutiérrez Gil"
  },
  description: "Portafolio inmersivo. Retratos pop, técnica mixta y texturas en pizarra.",
  authors: [{ name: "Naroa Gutiérrez Gil" }],
  creator: "Borja Moskv",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark bg-[#050505]" suppressHydrationWarning>
      <body className="bg-[#050505] text-[#EAEAEA] font-sans antialiased min-h-screen cursor-none overflow-x-hidden selection:bg-white selection:text-black">
        
        {/* Custom Cursor C5-REAL inyectado via Client Component para no romper el Server Layout */}
        <CustomCursorWrapper />

        {/* Global Navigation - Minimalist Silent Commerce */}
        <nav className="fixed top-8 right-12 z-[100] flex gap-8 mix-blend-difference pointer-events-auto">
          {[
            { name: 'Obras', path: '/' },
            { name: 'Biografía', path: '/biografia' },
            { name: 'Estudio', path: '/autodidact' },
            { name: 'Contacto', path: '/contacto' }
          ].map((item) => (
            <Link 
              key={item.name} 
              href={item.path}
              className="text-white text-[10px] md:text-xs uppercase tracking-[0.2em] relative py-1 group transition-colors"
            >
              {item.name}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-300 ease-out group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {children}
      </body>
    </html>
  );
}
