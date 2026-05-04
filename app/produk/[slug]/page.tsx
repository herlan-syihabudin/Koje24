// app/produk/[slug]/page.tsx
import ProductSchema from "@/components/ProductSchema";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug); // ambil data produk lo

  return (
    <>
      {/* Product Schema untuk SEO */}
      <ProductSchema product={product} />
      
      {/* Konten halaman produk lo yang sudah ada */}
      <div className="product-container">
        <h1>{product.name}</h1>
        <Image src={product.imageUrl} alt={product.name} />
        <p>{product.description}</p>
        <p className="price">Rp {product.price.toLocaleString()}</p>
      </div>
    </>
  );
}
