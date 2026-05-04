// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://koje24.com'
  
  // Halaman utama yang penting untuk di-index
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/produk`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tentang-kami`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/testimoni`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]
  
  // Daftar semua produk KOJE24
  const products = [
    'red-vitality',
    'golden-detox',
    'green-revive', 
    'sunrise-boost',
    'lemongrass-fresh',
    'yellow-immunity',
  ]
  
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/produk/${product}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))
  
  return [...routes, ...productRoutes]
}
