// app/produk/[slug]/page.tsx
import { notFound } from "next/navigation"
import { Metadata } from "next"
import Image from "next/image"
import { getProductBySlug, getAllProducts } from "@/lib/products"
import ProductSchema from "@/components/ProductSchema"

// Generate metadata dinamis berdasarkan produk
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = getProductBySlug(params.slug)
  
  if (!product) {
    return {
      title: "Produk Tidak Ditemukan | KOJE24",
    }
  }
  
  return {
    title: `${product.name} | KOJE24 - Cold Pressed Juice`,
    description: product.desc || product.description,
    openGraph: {
      title: product.name,
      description: product.desc || product.description,
      images: [product.img.startsWith("http") ? product.img : `https://koje24.com${product.img}`],
    },
  }
}

// Generate static params untuk semua produk (biar cepet loadingnya)
export async function generateStaticParams() {
  const products = getAllProducts()
  return products.map((product) => ({
    slug: product.id,
  }))
}

// ✅ HAPUS "async" DI SINI!
export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug)
  
  // Kalau produk gak ditemukan, tampilkan halaman 404
  if (!product) {
    notFound()
  }
  
  // Data untuk Product Schema
  const productSchemaData = {
    id: product.id,
    name: product.name,
    description: product.desc || product.description || "",
    price: product.price,
    imageUrl: product.img.startsWith("http") ? product.img : `https://koje24.com${product.img}`,
    sku: `KOJE-${product.id.toUpperCase().replace(/-/g, "")}`,
    availability: "InStock" as const,
    brand: product.brand || "KOJE24",
    shippingDetails: product.shippingDetails,
    returnPolicy: product.returnPolicy
  }

  return (
    <>
      {/* Product Schema untuk SEO */}
      <ProductSchema product={productSchemaData} />
      
      {/* Konten halaman produk */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Gambar Produk */}
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={product.img}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          
          {/* Info Produk */}
          <div>
            <h1 className="text-3xl font-bold text-[#0B4B50] mb-2">{product.name}</h1>
            {product.slogan && (
              <p className="text-lg text-[#E63946] mb-2 italic">{product.slogan}</p>
            )}
            <p className="text-2xl font-semibold text-[#E63946] mb-4">
              Rp {product.price.toLocaleString()}
            </p>
            <p className="text-gray-600 mb-6">{product.desc || product.description}</p>
            
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-[#0B4B50] mb-2">Bahan-bahan:</h2>
                <ul className="list-disc list-inside text-gray-600">
                  {product.ingredients.map((ingredient) => (
                    <li key={ingredient}>{ingredient}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {product.benefits && product.benefits.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-[#0B4B50] mb-2">Manfaat:</h2>
                <ul className="list-disc list-inside text-gray-600">
                  {product.benefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {product.goodFor && product.goodFor.length > 0 && (
              <div className="mb-6">
                <h2 className="font-semibold text-[#0B4B50] mb-2">Cocok untuk:</h2>
                <ul className="list-disc list-inside text-gray-600">
                  {product.goodFor.map((item) => (
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
