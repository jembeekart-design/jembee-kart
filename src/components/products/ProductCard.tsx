"use client";

import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  id?: string;

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

  imageHeight?: string;

  stock?: number;
}

export default function ProductCard({
  id = "",

  title = "Premium Sneakers",

  image = "",

  price = 2999,

  discountPrice = 1999,

  rating = 4.8,

  backgroundColor = "#ffffff",

  textColor = "#111827",

  buttonColor = "#2563eb",

  buttonTextColor = "#ffffff",

  borderRadius = "24px",

  cardWidth = "100%",

  imageHeight = "160px",

  stock = 10
}: ProductCardProps) {
  const { addToCart } =
    useCart();

  const discountPercentage =
    Math.round(
      ((price -
        discountPrice) /
        price) *
        100
    );

  return (
    <div
      className="overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{
        backgroundColor,
        borderRadius,
        width: cardWidth
      }}
    >

      {/* IMAGE */}

      <div
        className="relative w-full overflow-hidden bg-gray-100"
        style={{
          height: imageHeight
        }}
      >

        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-bold text-gray-400">
            No Image
          </div>
        )}

        {/* DISCOUNT */}

        <div className="absolute left-2 top-2 rounded-full bg-red-500 px-3 py-1 text-[10px] font-black text-white shadow-md">

          {discountPercentage}% OFF

        </div>

        {/* STOCK */}

        {stock <= 0 ? (
          <div className="absolute right-2 top-2 rounded-full bg-black px-3 py-1 text-[10px] font-black text-white">

            OUT OF STOCK

          </div>
        ) : (
          <div className="absolute right-2 top-2 rounded-full bg-green-500 px-3 py-1 text-[10px] font-black text-white">

            IN STOCK

          </div>
        )}

      </div>

      {/* CONTENT */}

      <div className="p-3">

        {/* TITLE */}

        <h2
          className="line-clamp-2 text-base font-black md:text-lg"
          style={{
            color: textColor
          }}
        >
          {title}
        </h2>

        {/* RATING */}

        <div className="mt-1 flex items-center gap-1">

          <span className="text-yellow-500">
            ⭐
          </span>

          <span className="text-xs font-bold text-gray-600">
            {rating}
          </span>

        </div>

        {/* PRICE */}

        <div className="mt-2 flex items-center gap-2">

          <span className="text-xl font-black text-gray-900">
            ₹{discountPrice}
          </span>

          <span className="text-xs font-semibold text-gray-400 line-through">
            ₹{price}
          </span>

        </div>

        {/* BUTTONS */}

        <div className="mt-4 flex gap-2">

          <button
            onClick={(
              event
            ) => {
              event.preventDefault();

              addToCart({
                id,
                title,
                image,
                price:
                  discountPrice,
                quantity: 1
              });
            }}
            className="flex-1 rounded-xl px-4 py-2 text-xs font-black transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor:
                buttonColor,

              color:
                buttonTextColor
            }}
          >
            Add To Cart
          </button>

          <button className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-2 text-xs font-black text-gray-700 transition-all duration-300 hover:bg-gray-200">

            Buy

          </button>

        </div>

      </div>

    </div>
  );
}
