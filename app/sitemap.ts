// app/sitemap.ts
import { MetadataRoute } from 'next'

// 🔥 AMBIL PRODUK DARI API (AGAR DINAMIS)
async function getProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://koje24.com'
    const res = await fetch(`${baseUrl}/api/master-produk`, {
      cache: 'no-store'
    })
    const data = await res.json()
    return data?.success ? data.products : []
  } catch (error) {
    console.error('Error fetching products for sitemap:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://koje24.com'
  
  // ✅ Halaman utama yang penting untuk di-index
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // ✅ PERBAIKI: /produk → sudah ada di ProductGrid
    {
      url: `${baseUrl}/#produk`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // ✅ PERBAIKI: /tentang-koje24 (bukan /tentang-kami)
    {
      url: `${baseUrl}/tentang-koje24`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/manfaat`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/testimoni`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pusat-bantuan`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]
  
  // ✅ DAFTAR PRODUK DARI API (BUKAN HARDCODE)
  const products = await getProducts()
  
  const productRoutes: MetadataRoute.Sitemap = products
    .filter((p: any) => p.aktif === 'YES') // ✅ HANYA PRODUK AKTIF
    .map((product: any) => ({
      url: `${baseUrl}/produk/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  
  // ✅ PAKET JUGA DI-INDEX
  const packageRoutes: MetadataRoute.Sitemap = products
    .filter((p: any) => p.isPackage && p.aktif === 'YES')
    .map((product: any) => ({
      url: `${baseUrl}/#langganan`, // Link ke section paket
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
  
  return [...routes, ...productRoutes, ...packageRoutes]
}
