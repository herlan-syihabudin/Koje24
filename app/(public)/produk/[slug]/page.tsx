// app/(public)/produk/[slug]/page.tsx

import { notFound } from "next/navigation"
import { Metadata } from "next"
import Image from "next/image"
import ProductSchema from "@/components/ProductSchema"

interface ProductFromAPI {
  id: string;
  slug: string;
  nama: string;
  kategori: string;
  harga: number;
  stok: number;
  aktif: string;
  img: string;
  slogan?: string;
  ingredients?: string[];
  benefits?: string[];
  goodFor?: string[];
  consumeTime?: string;
  isPackage?: boolean;
  brand?: string;
  desc?: string;
}

async function getProductBySlug(slug: string): Promise<ProductFromAPI | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://koje24.com"
    const res = await fetch(`${baseUrl}/api/master-produk`, { cache: "no-store" })
    if (!res.ok) return null
    const data = await res.json()
    const products = data?.success ? data.products : []
    return products.find((p: ProductFromAPI) => p.slug === slug) || null
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

async function getAllProducts(): Promise<ProductFromAPI[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://koje24.com"
    const res = await fetch(`${baseUrl}/api/master-produk`, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    return data?.success ? data.products : []
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

// ✅ OPTIMASI METADATA UNTUK SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  
  if (!product) {
    return {
      title: "Produk Tidak Ditemukan | KOJE24",
    }
  }
  
  const title = `${product.nama} - Cold Pressed Juice Premium | KOJE24`
  const description = product.desc || product.slogan || `Cold-pressed juice ${product.nama} alami tanpa gula tambahan. ${product.benefits?.join(' ')}`
  const keywords = `${product.nama}, cold pressed juice, jus sehat, ${product.ingredients?.join(', ')}, jus detox, minuman sehat alami`
  
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: [product.img],
      type: 'product',
      locale: 'id_ID',
    },
    alternates: {
      canonical: `https://koje24.com/produk/${product.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

// Generate static params
export async function generateStaticParams() {
  const products = await getAllProducts()
  return products
    .filter((p) => p.aktif === "YES")
    .map((product: ProductFromAPI) => ({
      slug: product.slug,
    }))
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  
  if (!product) {
    notFound()
  }
  
  // ✅ SKIP PAKET
  if (product.isPackage || product.kategori?.toLowerCase() === "paket") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-[#0B4B50] mb-4">Paket {product.nama}</h1>
        <p className="text-gray-600 mb-6">Halaman detail untuk paket tersedia di bagian langganan.</p>
        <a href="/#langganan" className="inline-block bg-[#0FA3A8] text-white px-6 py-3 rounded-full hover:bg-[#0DC1C7] transition-colors">
          Lihat Paket Langganan
        </a>
      </div>
    )
  }

  const productSchemaData = {
    id: product.id,
    name: product.nama,
    description: product.desc || product.slogan || "",
    price: product.harga,
    imageUrl: product.img,
    sku: `KOJE-${product.id.toUpperCase().replace(/-/g, "")}`,
    availability: product.stok > 0 ? "InStock" as const : "OutOfStock" as const,
    brand: product.brand || "KOJE24",
  }

  return (
    <>
      <ProductSchema product={productSchemaData} />
      
      {/* ✅ BREADCRUMB UNTUK SEO */}
      <div className="container mx-auto px-4 pt-24">
        <nav className="text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1">
            <li><a href="/" className="hover:text-[#0FA3A8] transition">Beranda</a></li>
            <li><span className="mx-1">/</span></li>
            <li><a href="/#produk" className="hover:text-[#0FA3A8] transition">Produk</a></li>
            <li><span className="mx-1">/</span></li>
            <li className="text-[#0FA3A8] font-semibold">{product.nama}</li>
          </ol>
        </nav>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* IMAGE */}
          <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={product.img || "/placeholder.png"}
              alt={`${product.nama} - Cold Pressed Juice KOJE24`}
              fill
              className="object-cover"
              priority
            />
            {product.stok <= 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">Habis</span>
              </div>
            )}
          </div>
          
          {/* DETAIL */}
          <div>
            <div className="mb-2">
              <span className="text-xs font-medium text-[#0FA3A8] bg-[#0FA3A8]/10 px-3 py-1 rounded-full">
                {product.kategori || "Produk"}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-[#0B4B50] mb-2">
              {product.nama}
            </h1>
            
            {product.slogan && (
              <p className="text-lg text-[#0FA3A8] font-medium mb-4 italic">“{product.slogan}”</p>
            )}
            
            <p className="text-3xl font-bold text-[#0FA3A8] mb-4">
              Rp {product.harga.toLocaleString()}
            </p>
            
            {product.desc && (
              <p className="text-gray-600 mb-6 leading-relaxed">{product.desc}</p>
            )}
            
            {/* INGREDIENTS */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-[#0B4B50] mb-2">🌿 Bahan-bahan:</h2>
                <ul className="flex flex-wrap gap-2">
                  {product.ingredients.map((ingredient: string) => (
                    <li key={ingredient} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* BENEFITS */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-[#0B4B50] mb-2">✨ Manfaat:</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {product.benefits.map((benefit: string) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* GOOD FOR */}
            {product.goodFor && product.goodFor.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-[#0B4B50] mb-2">🎯 Cocok untuk:</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {product.goodFor.map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* CONSUME TIME */}
            {product.consumeTime && (
              <div className="mb-6">
                <h2 className="font-semibold text-[#0B4B50] mb-2">⏰ Waktu konsumsi terbaik:</h2>
                <p className="text-gray-600">{product.consumeTime}</p>
              </div>
            )}
            
            <div className="mb-6">
              <p className="text-sm text-gray-500">Stok: {product.stok > 0 ? `${product.stok} botol tersedia` : "Habis"}</p>
            </div>
            
            <button 
              disabled={product.stok <= 0}
              className={`w-full py-3 rounded-xl font-semibold transition-colors ${product.stok > 0 ? "bg-[#0FA3A8] text-white hover:bg-[#0DC1C7]" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
            >
              {product.stok > 0 ? "🛒 Tambah ke Keranjang" : "Stok Habis"}
            </button>
            
            <a href="https://wa.me/6282213139580" target="_blank" rel="noopener noreferrer" className="block w-full mt-3 py-3 rounded-xl font-semibold text-center border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors">
              💬 Tanya via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
