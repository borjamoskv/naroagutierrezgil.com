import React from 'react';
import { notFound } from 'next/navigation';
import { artworkData } from '@/lib/artworkData';
import ArtworkDetailClient from './ArtworkDetailClient';

export function generateStaticParams() {
  return artworkData.map((artwork) => ({
    slug: artwork.slug,
  }));
}

export default function ArtworkDetailPage({ params }: { params: { slug: string } }) {
  const artwork = artworkData.find((a) => a.slug === params.slug);

  if (!artwork) {
    notFound();
  }

  return <ArtworkDetailClient artwork={artwork} />;
}
