import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Naroa Gutiérrez Gil Oficial',
    short_name: 'Naroa Arte',
    description: 'Portafolio Oficial interactivo de la artista Naroa Gutiérrez Gil.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#2B3BE5',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
