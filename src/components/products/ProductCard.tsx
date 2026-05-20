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

  /* AUTO RANDOM COLOR */

  const colorIndex =
    id.length %
    CARD_COLORS.length;

  const gradientColor =
    CARD_COLORS[colorIndex];

  return (
    <div
      className={`
        overflow-hidden
        rounded-2xl
        bg-gradient-to-br
        ${gradientColor}
        p-[1.5px]
        shadow-md
        transition-all
        duration-300
        hover:-translate-y-1
      `}
    >

      <div className="overflow-hidden rounded-2xl bg-white">

        {/* IMAGE */}

        <div className="relative">

          <img
            src={image}
            alt={title}
            className="
              h-[155px]
              w-full
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
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              bg-white
              shadow
            "
          >

            <Heart
              size={15}
              className="text-gray-700"
            />

          </button>

          {/* RATING */}

          <div
            className="
              absolute
              bottom-2
              left-2
              rounded
              bg-white
              px-2
              py-[3px]
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

        </div>

        {/* CONTENT */}

        <div className="p-2">

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
              mt-1
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
                text-[15px]
                font-bold
                text-black
              "
            >

              ₹{discountPrice}

            </span>

          </div>

          {/* HOT DEAL */}

          <div
            className="
              mt-1.5
              inline-block
              rounded
              bg-green-100
              px-2
              py-[3px]
              text-[10px]
              font-semibold
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
