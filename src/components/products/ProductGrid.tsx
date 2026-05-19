"use client";

import ProductCard from "@/components/products/ProductCard";

interface Product {
  id: string;

  title?: string;

  image?: string;

  price?: number;

  discountPrice?: number;

  rating?: number;

  backgroundColor?: string;

  textColor?: string;

  buttonColor?: string;

  buttonTextColor?: string;

  borderRadius?: string;

  cardWidth?: string;
}

interface ProductGridProps {
  products?: Product[];
}

export default function ProductGrid({
  products = [
    {
      id: "1",

      title: "Premium Sneakers",

      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff",

      price: 2999,

      discountPrice: 1999,

      rating: 4.8,

      backgroundColor: "#ffffff",

      textColor: "#111827",

      buttonColor: "#2563eb",

      buttonTextColor: "#ffffff",

      borderRadius: "18px",

      cardWidth: "100%"
    },

    {
      id: "2",

      title: "Smart Watch",

      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30",

      price: 5999,

      discountPrice: 3999,

      rating: 4.6,

      backgroundColor: "#ffffff",

      textColor: "#111827",

      buttonColor: "#7c3aed",

      buttonTextColor: "#ffffff",

      borderRadius: "18px",

      cardWidth: "100%"
    },

    {
      id: "3",

      title: "Wireless Headphones",

      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",

      price: 4999,

      discountPrice: 2999,

      rating: 4.7,

      backgroundColor: "#ffffff",

      textColor: "#111827",

      buttonColor: "#db2777",

      buttonTextColor: "#ffffff",

      borderRadius: "18px",

      cardWidth: "100%"
    },

    {
      id: "4",

      title: "Luxury Backpack",

      image:
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa",

      price: 3499,

      discountPrice: 2499,

      rating: 4.5,

      backgroundColor: "#ffffff",

      textColor: "#111827",

      buttonColor: "#ea580c",

      buttonTextColor: "#ffffff",

      borderRadius: "18px",

      cardWidth: "100%"
    }
  ]
}: ProductGridProps) {
  return (
    <section className="w-full overflow-hidden px-2 py-4">

      {/* HEADER */}

      <div className="mb-4 flex items-center justify-between">

        <h2 className="text-2xl font-black text-gray-900">
          Trending Products
        </h2>

        <button className="text-sm font-black text-blue-600">
          View All
        </button>

      </div>

      {/* GRID */}

      <div className="grid grid-cols-2 gap-2">

        {products.map((product) => {
          return (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              image={product.image}
              price={product.price}
              discountPrice={
                product.discountPrice
              }
              rating={product.rating}
              backgroundColor={
                product.backgroundColor
              }
              textColor={
                product.textColor
              }
              buttonColor={
                product.buttonColor
              }
              buttonTextColor={
                product.buttonTextColor
              }
              borderRadius={
                product.borderRadius
              }
              cardWidth="100%"
            />
          );
        })}

      </div>

    </section>
  );
}
