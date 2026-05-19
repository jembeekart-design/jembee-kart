"use client";

import { Heart } from "lucide-react";

interface ProductCardProps {
  id?: string;

  title?: string;

  image?: string;

  price?: number;

  discountPrice?: number;

  rating?: number;

  reviews?: number;
}

export default function ProductCard({
  title = "PETER ENGLAND Polo",

  image = "https://images.unsplash.com/photo-1581655353564-df123a1eb820",

  price = 1099,

  discountPrice = 539,

  rating = 4.2,

  reviews = 5000
}: ProductCardProps) {
  const discount =
    Math.round(
      ((price -
        discountPrice) /
        price) *
        100
    );

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">

      {/* IMAGE */}

      <div className="relative">

        <img
          src={image}
          alt={title}
          className="h-[220px] w-full object-cover"
        />

        {/* WISHLIST */}

        <button className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow">

          <Heart
            size={18}
            className="text-gray-700"
          />

        </button>

        {/* RATING */}

        <div className="absolute bottom-2 left-2 rounded bg-white px-2 py-1 text-[11px] font-bold text-black shadow">

          {rating} ★ |{" "}
          {reviews >= 1000
            ? `${Math.floor(
                reviews / 1000
              )}k`
            : reviews}

        </div>

      </div>

      {/* CONTENT */}

      <div className="p-2">

        {/* TITLE */}

        <h3 className="truncate text-[15px] font-bold text-black">

          {title}

        </h3>

        {/* SUBTITLE */}

        <p className="truncate text-xs text-gray-500">

          Men Solid Polo Neck...

        </p>

        {/* PRICE */}

        <div className="mt-1 flex items-center gap-2">

          <span className="text-sm font-bold text-green-600">

            ↓{discount}%

          </span>

          <span className="text-xs text-gray-400 line-through">

            ₹{price}

          </span>

          <span className="text-lg font-bold text-black">

            ₹{discountPrice}

          </span>

        </div>

        {/* DEAL */}

        <div className="mt-2 inline-block rounded bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700">

          Hot Deal

        </div>

      </div>

    </div>
  );
}
