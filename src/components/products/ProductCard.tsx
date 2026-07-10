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

  return (
    <div
      className="
  overflow-hidden
  rounded-[24px]
  p-[1.5px]
  shadow-md
  transition-all
  duration-300
  hover:-translate-y-1
"
style={{
  background: "var(--primary-color)"
}}
    >

      <div
        className="
          overflow-hidden
          rounded-[22px]
          bg-[var(--card-color)]
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
              bg-[var(--card-color)]
              shadow-lg
            "
          >

            <Heart
              size={16}
              className="text-[var(--text-color)]"
            />

          </button>

          {/* RATING */}

          <div
            className="
              absolute
              bottom-2
              left-2
              rounded-xl
              bg-[var(--card-color)]
              px-2
              py-1
              text-[10px]
              font-bold
              text-[var(--text-color)]
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
                bg-[var(--card-color)]/70
                px-2
                py-1
                text-[10px]
                font-bold
                text-[var(--button-text-color)]
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
              text-[var(--text-color)]
            "
          >

            {title}

          </h3>

          {/* SUBTITLE */}

          <p
            className="
              truncate
              text-[10px]
              text-[var(--muted-text-color)]
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
                text-[var(--success-color)]
              "
            >

              ↓{discount}%

            </span>

            <span
              className="
                text-[10px]
                text-[var(--muted-text-color)]
                line-through
              "
            >

              ₹{price}

            </span>

            <span
              className="
                text-[16px]
                font-black
                text-[var(--text-color)]
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
              bg-[var(--success-color)]
              px-2
              py-[4px]
              text-[10px]
              font-bold
              text-[var(--success-color)]
            "
          >

            Hot Deal

          </div>

        </div>

      </div>

    </div>
  );
}
