// app/produk/[slug]/page.tsx
import { notFound } from "next/navigation"
import { Metadata } from "next"
import Image from "next/image"
import ProductSchema from "@/components/ProductSchema"

// 🔥 AMBIL DATA DARI API LIVE (BUKAN DARI lib/products)
async function getProductBySlug(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "https://koje24.com"}/api/master-produk`, {
    cache: "no-store",
  })
  const data = await res.json()
  const products = data?.success ? data.products : []
  return products.find((p: any) => p.slug === slug)
}

async function getAllProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "https://koje24.com"}/api/master-produk`, {
    cache: "no-store",
  })
  const data = await res.json()
  return data?.success ? data.products : []
}

// Generate metadata dinamis berdasarkan produk
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  
  if (!product) {
    return {
      title: "Produk Tidak Ditemukan | KOJE24",
    }
  }
  
  return {
    title: `${product.nama} | KOJE24 - Cold Pressed Juice`,
    description: product.desc || product.description || `Cold-pressed juice ${product.nama} alami tanpa gula tambahan`,
    openGraph: {
      title: product.nama,
      description: product.desc || product.description || `Cold-pressed juice ${product.nama}`,
      images: [product.img],
    },
  }
}

// Generate static params untuk semua produk (opsional, untuk build time)
export async function generateStaticParams() {
  const products = await getAllProducts()
  return products.map((product: any) => ({
    slug: product.slug,
  }))
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  
  if (!product) {
    notFound()
  }
  
  const productSchemaData = {
    id: product.id,
    name: product.nama,
    description: product.desc || product.description || "",
    price: product.harga,
    imageUrl: product.img,
    sku: `KOJE-${product.id.toUpperCase().replace(/-/g, "")}`,
    availability: "InStock" as const,
    brand: product.brand || "KOJE24",
    shippingDetails: product.shippingDetails,
    returnPolicy: product.returnPolicy
  }

  return (
    <>
      <ProductSchema product={productSchemaData} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={product.img || "/placeholder.png"}
              alt={product.nama}
              fill
              className="object-cover"
              priority
            />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-[#0B4B50] mb-2">{product.nama}</h1>
            {product.slogan && (
              <p className="text-lg text-[#E63946] mb-2 italic">{product.slogan}</p>
            )}
            <p className="text-2xl font-semibold text-[#E63946] mb-4">
              Rp {product.harga.toLocaleString()}
            </p>
            <p className="text-gray-600 mb-6">{product.desc || product.description || `Cold-pressed juice ${product.nama} alami tanpa gula tambahan.`}</p>
            
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-[#0B4B50] mb-2">Bahan-bahan:</h2>
                <ul className="list-disc list-inside text-gray-600">
                  {product.ingredients.map((ingredient: string) => (
                    <li key={ingredient}>{ingredient}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {product.benefits && product.benefits.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-[#0B4B50] mb-2">Manfaat:</h2>
                <ul className="list-disc list-inside text-gray-600">
                  {product.benefits.map((benefit: string) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {product.goodFor && product.goodFor.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-[#0B4B50] mb-2">Cocok untuk:</h2>
                <ul className="list-disc list-inside text-gray-600">
                  {product.goodFor.map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {product.consumeTime && (
              <div className="mb-6">
                <h2 className="font-semibold text-[#0B4B50] mb-2">Waktu konsumsi terbaik:</h2>
                <p className="text-gray-600">{product.consumeTime}</p>
              </div>
            )}
            
            <button className="w-full bg-[#E63946] text-white py-3 rounded-lg font-semibold hover:bg-[#c53030] transition-colors">
              Tambah ke Keranjang
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
