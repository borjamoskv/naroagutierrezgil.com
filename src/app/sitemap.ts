import type { MetadataRoute } from 'next'
import { getBlogPosts } from '@/lib/blogData'

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogPosts();
  
  const blogUrls = posts.map(post => ({
    url: `https://naroagutierrezgil.com/blog/${post.slug}`,
    lastModified: new Date(post.date.split('/').reverse().join('-')), // Approximating date from DD/MM/YYYY
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: 'https://naroagutierrezgil.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: 'https://naroagutierrezgil.com/obra',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://naroagutierrezgil.com/juegos',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://naroagutierrezgil.com/shop',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://naroagutierrezgil.com/biografia',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://naroagutierrezgil.com/autodidact',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://naroagutierrezgil.com/contacto',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: 'https://naroagutierrezgil.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...blogUrls,
  ]
}
