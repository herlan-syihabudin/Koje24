// components/ProductSchema.tsx
"use client";

interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  sku: string;
  availability: "InStock" | "OutOfStock" | "PreOrder";
  ratingValue?: number;
  ratingCount?: number;
}

export default function ProductSchema({ product }: { product: ProductData }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "KOJE24",
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "IDR",
      availability: `https://schema.org/${product.availability}`,
      seller: {
        "@type": "Organization",
        name: "KOJE24",
      },
    },
    ...(product.ratingValue && product.ratingCount && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.ratingValue,
        reviewCount: product.ratingCount,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
