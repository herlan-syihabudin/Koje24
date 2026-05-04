// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/invoice/',
        '/checkout',
        '/api/',
        '/dashboard/',
        '/pusat-bantuan/',
        '/unsubscribe',
      ],
    },
    sitemap: 'https://koje24.com/sitemap.xml',
  }
}
