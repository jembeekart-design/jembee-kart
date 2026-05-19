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

  image = "https://images.unsplash.com/photo-1542291026-7eec264c27ff",

  price = 2999,

  discountPrice = 1999,

  rating = 4.8,

  backgroundColor = "#ffffff",

  textColor = "#111827",

  buttonColor = "#2563eb",

  buttonTextColor = "#ffffff",

  borderRadius = "16px",

  cardWidth = "100%",

  imageHeight = "80px",

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
      className="overflow-hidden shadow-md"
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

        <img
          src={
            image ||
            "https://via.placeholder.com/300x300"
          }
          alt={title}
          className="h-full w-full object-cover"
        />

        {/* DISCOUNT */}

        <div className="absolute left-1 top-1 rounded-full bg-red-500 px-2 py-[2px] text-[8px] font-black text-white">

          {discountPercentage}% OFF

        </div>

        {/* STOCK */}

        {stock <= 0 ? (
          <div className="absolute right-1 top-1 rounded-full bg-black px-2 py-[2px] text-[8px] font-black text-white">

            OUT

          </div>
        ) : (
          <div className="absolute right-1 top-1 rounded-full bg-green-500 px-2 py-[2px] text-[8px] font-black text-white">

            STOCK

          </div>
        )}

      </div>

      {/* CONTENT */}

      <div className="p-2">

        {/* TITLE */}

        <h2
          className="line-clamp-2 text-xs font-black leading-tight"
          style={{
            color: textColor
          }}
        >
          {title}
        </h2>

        {/* RATING */}

        <div className="mt-1 flex items-center gap-1">

          <span className="text-[10px]">
            ⭐
          </span>

          <span className="text-[10px] font-bold text-gray-500">
            {rating}
          </span>

        </div>

        {/* PRICE */}

        <div className="mt-1 flex items-center gap-1">

          <span className="text-base font-black text-gray-900">
            ₹{discountPrice}
          </span>

          <span className="text-[9px] text-gray-400 line-through">
            ₹{price}
          </span>

        </div>

        {/* BUTTONS */}

        <div className="mt-2 flex gap-1">

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
            className="flex-1 rounded-lg px-2 py-1.5 text-[9px] font-black"
            style={{
              backgroundColor:
                buttonColor,

              color:
                buttonTextColor
            }}
          >
            Cart
          </button>

          <button className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1.5 text-[9px] font-black text-gray-700">

            Buy

          </button>

        </div>

      </div>

    </div>
  );
}
