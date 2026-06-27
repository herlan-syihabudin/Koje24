// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/invoice/',
          '/checkout',
          '/api/',
          '/dashboard/',
          '/admin/',
          '/unsubscribe',
          '/_next/',
          '/_vercel/',
        ],
      },
    ],
    sitemap: 'https://koje24.com/sitemap.xml',
    host: 'https://koje24.com',
  }
}
