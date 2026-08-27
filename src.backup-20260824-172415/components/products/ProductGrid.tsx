"use client";

import ProductCard from "@/components/products/ProductCard";

/* ======================================================
TYPES
====================================================== */

interface Product {
  id: string;

  title?: string;

  images?: string[];

  image?: string;

  price?: number;

  discountPrice?: number;

  rating?: number;

  reviews?: number;
}

interface ProductGridProps {
  products?: Product[];
}

/* ======================================================
COMPONENT
====================================================== */

export default function ProductGrid({
  products = [
    {
      id: "1",

      title:
        "PETER ENGLAND Polo T-Shirt",

      images: [
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820"
      ],

      price: 1099,

      discountPrice: 539,

      rating: 4.2,

      reviews: 5000
    },

    {
      id: "2",

      title:
        "US Polo Casual T-Shirt",

      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
      ],

      price: 1499,

      discountPrice: 699,

      rating: 4.3,

      reviews: 829
    },

    {
      id: "3",

      title:
        "THE BEAR HOUSE Shirt",

      images: [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf"
      ],

      price: 1999,

      discountPrice: 999,

      rating: 4.1,

      reviews: 1000
    },

    {
      id: "4",

      title:
        "Premium Fashion Polo",

      images: [
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c"
      ],

      price: 1299,

      discountPrice: 599,

      rating: 4.4,

      reviews: 2200
    }
  ]
}: ProductGridProps) {
  return (
    <section className="w-full bg-[var(--primary-color)] px-2 py-3">

      {/* TOP FILTER BAR */}

      <div
        className="
          mb-4
          flex
          items-center
          justify-between
          rounded-2xl
          bg-[var(--card-color)]
          px-4
          py-3
          shadow-sm
        "
      >

        {/* SORT */}

        <button
          className="
            flex
            flex-1
            items-center
            justify-center
            gap-2
            border-r
            border-[var(--border-color)]
            text-sm
            font-bold
            text-[var(--text-color)]
          "
        >

          <span className="text-lg">
            ⇅
          </span>

          Sort

        </button>

        {/* FILTER */}

        <button
          className="
            flex
            flex-1
            items-center
            justify-center
            gap-2
            text-sm
            font-bold
            text-[var(--text-color)]
          "
        >

          <span className="text-lg">
            ⚙
          </span>

          Filter

        </button>

      </div>

      {/* PRODUCT GRID */}

      <div className="grid grid-cols-2 gap-3">

        {products.map((product) => {
          return (
            <ProductCard
              key={product.id}

              id={product.id}

              title={product.title}

              images={
                product.images ||
                (
                  product.image
                    ? [product.image]
                    : []
                )
              }

              price={product.price}

              discountPrice={
                product.discountPrice
              }

              rating={
                product.rating
              }

              reviews={
                product.reviews
              }
            />
          );
        })}

      </div>

    </section>
  );
}
