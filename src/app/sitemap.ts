import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://naroagutierrezgil.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]
}
