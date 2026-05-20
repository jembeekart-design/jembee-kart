"use client";

import { Heart } from "lucide-react";

interface ProductCardProps {
  id?: string;

  title?: string;

  images?: string[];

  price?: number;

  discountPrice?: number;

  rating?: number;

  reviews?: number;
}

const CARD_COLORS = [
  "from-pink-500 to-rose-500",

  "from-blue-500 to-cyan-500",

  "from-purple-500 to-indigo-500",

  "from-orange-500 to-amber-500",

  "from-green-500 to-emerald-500",

  "from-fuchsia-500 to-pink-500"
];

export default function ProductCard({
  id = "",

  title = "PETER ENGLAND Polo",

  images = [],

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

  /* FIRST IMAGE */

  const firstImage =
    images?.[0] ||
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820";

  /* RANDOM CARD COLOR */

  const colorIndex =
    id.length %
    CARD_COLORS.length;

  const gradientColor =
    CARD_COLORS[colorIndex];

  return (
    <div
      className={`
        overflow-hidden
        rounded-[24px]
        bg-gradient-to-br
        ${gradientColor}
        p-[1.5px]
        shadow-md
        transition-all
        duration-300
        hover:-translate-y-1
      `}
    >

      <div
        className="
          overflow-hidden
          rounded-[22px]
          bg-white
        "
      >

        {/* IMAGE AREA */}

        <div className="relative">

          <img
            src={firstImage}
            alt={title}
            className="
              h-[165px]
              w-full
              rounded-b-[32px]
              object-cover
            "
          />

          {/* WISHLIST */}

          <button
            className="
              absolute
              right-2
              top-2
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-white
              shadow-lg
            "
          >

            <Heart
              size={16}
              className="text-gray-700"
            />

          </button>

          {/* RATING */}

          <div
            className="
              absolute
              bottom-2
              left-2
              rounded-xl
              bg-white
              px-2
              py-1
              text-[10px]
              font-bold
              text-black
              shadow
            "
          >

            {rating} ★ |{" "}
            {reviews >= 1000
              ? `${Math.floor(
                  reviews / 1000
                )}k`
              : reviews}

          </div>

          {/* MULTI IMAGE BADGE */}

          {images.length >
            1 && (
            <div
              className="
                absolute
                bottom-2
                right-2
                rounded-xl
                bg-black/70
                px-2
                py-1
                text-[10px]
                font-bold
                text-white
                backdrop-blur-md
              "
            >
              +{images.length}
              Photos
            </div>
          )}

        </div>

        {/* CONTENT */}

        <div className="p-2.5">

          {/* TITLE */}

          <h3
            className="
              truncate
              text-[13px]
              font-bold
              text-black
            "
          >

            {title}

          </h3>

          {/* SUBTITLE */}

          <p
            className="
              truncate
              text-[10px]
              text-gray-500
            "
          >

            Premium Fashion Product

          </p>

          {/* PRICE */}

          <div
            className="
              mt-1.5
              flex
              items-center
              gap-1.5
            "
          >

            <span
              className="
                text-[11px]
                font-bold
                text-green-600
              "
            >

              ↓{discount}%

            </span>

            <span
              className="
                text-[10px]
                text-gray-400
                line-through
              "
            >

              ₹{price}

            </span>

            <span
              className="
                text-[16px]
                font-black
                text-black
              "
            >

              ₹{discountPrice}

            </span>

          </div>

          {/* HOT DEAL */}

          <div
            className="
              mt-2
              inline-block
              rounded-lg
              bg-green-100
              px-2
              py-[4px]
              text-[10px]
              font-bold
              text-green-700
            "
          >

            Hot Deal

          </div>

        </div>

      </div>

    </div>
  );
}
