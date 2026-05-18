"use client";

interface ProductCardProps {
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
}

export default function ProductCard({
  title = "Premium Sneakers",

  image = "https://images.unsplash.com/photo-1542291026-7eec264c27ff",

  price = 2999,

  discountPrice = 1999,

  rating = 4.8,

  backgroundColor = "#ffffff",

  textColor = "#111827",

  buttonColor = "#2563eb",

  buttonTextColor = "#ffffff",

  borderRadius = "28px",

  cardWidth = "100%",

  imageHeight = "240px"
}: ProductCardProps) {
  return (
    <div
      className="overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      style={{
        backgroundColor: backgroundColor,

        borderRadius: borderRadius,

        width: cardWidth
      }}
    >

      {/* IMAGE */}

      <div
        className="relative w-full overflow-hidden"
        style={{
          height: imageHeight
        }}
      >

        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover"
        />

        {/* DISCOUNT BADGE */}

        <div className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white shadow-lg">

          SALE

        </div>

      </div>

      {/* CONTENT */}

      <div className="p-4">

        {/* TITLE */}

        <h2
          className="line-clamp-2 text-lg font-black md:text-xl"
          style={{
            color: textColor
          }}
        >
          {title}
        </h2>

        {/* RATING */}

        <div className="mt-2 flex items-center gap-1">

          <span className="text-yellow-500">
            ⭐
          </span>

          <span className="text-sm font-bold text-gray-600">
            {rating}
          </span>

        </div>

        {/* PRICE */}

        <div className="mt-3 flex items-center gap-3">

          <span className="text-2xl font-black text-gray-900">
            ₹{discountPrice}
          </span>

          <span className="text-sm font-semibold text-gray-400 line-through">
            ₹{price}
          </span>

        </div>

        {/* BUTTONS */}

        <div className="mt-5 flex gap-3">

          <button
            className="flex-1 rounded-2xl px-4 py-3 text-sm font-black transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: buttonColor,

              color: buttonTextColor
            }}
          >
            Add To Cart
          </button>

          <button className="rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm font-black text-gray-700 transition-all duration-300 hover:bg-gray-200">
            Buy
          </button>

        </div>

      </div>

    </div>
  );
}
