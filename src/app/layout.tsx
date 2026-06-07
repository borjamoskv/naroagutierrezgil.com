import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "Naroa Gutiérrez Gil | Artivista",
  description: "Portafolio Oficial. Retratos hiperrealistas pop, técnica mixta y texturas termodinámicas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} bg-[#0A0A0A] text-[#EAEAEA] antialiased`}>
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
