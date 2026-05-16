"use client";

interface SellerSectionProps {
  sellerTitle?: string;

  sellerDescription?: string;

  sellerButtonText?: string;

  resellerTitle?: string;

  resellerDescription?: string;

  resellerButtonText?: string;
}

export default function SellerSection({
  sellerTitle = "Become A Seller",

  sellerDescription = "Sell products with AI powered tools, analytics and advanced ecommerce automation.",

  sellerButtonText = "Start Selling",

  resellerTitle = "Reseller Program",

  resellerDescription = "Start reselling products without inventory and grow your online business easily.",

  resellerButtonText = "Join Now"
}: SellerSectionProps) {
  return (
    <section className="w-full overflow-hidden px-4 py-6 md:px-6">

      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">

        {/* SELLER CARD */}

        <div className="overflow-hidden rounded-[30px] bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-2xl md:rounded-[50px] md:p-10">

          <h2 className="text-3xl font-black leading-tight md:text-6xl">
            {sellerTitle}
          </h2>

          <p className="mt-5 text-lg leading-relaxed text-indigo-100 md:text-2xl">
            {sellerDescription}
          </p>

          <button className="mt-8 rounded-2xl bg-white px-6 py-3 font-bold text-indigo-700 transition-all duration-300 hover:scale-105 md:px-12 md:py-5">
            {sellerButtonText}
          </button>

        </div>

        {/* RESELLER CARD */}

        <div className="overflow-hidden rounded-[30px] bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white shadow-2xl md:rounded-[50px] md:p-10">

          <h2 className="text-3xl font-black leading-tight md:text-6xl">
            {resellerTitle}
          </h2>

          <p className="mt-5 text-lg leading-relaxed text-pink-100 md:text-2xl">
            {resellerDescription}
          </p>

          <button className="mt-8 rounded-2xl bg-white px-6 py-3 font-bold text-rose-600 transition-all duration-300 hover:scale-105 md:px-12 md:py-5">
            {resellerButtonText}
          </button>

        </div>

      </div>

    </section>
  );
}
