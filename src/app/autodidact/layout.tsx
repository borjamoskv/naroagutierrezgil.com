import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Estudio & Autodidacta | Naroa Gutiérrez Gil",
  description: "Filosofía autodidacta y exploración de materiales del estudio de Naroa Gutiérrez.",
};

export default function AutodidactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
