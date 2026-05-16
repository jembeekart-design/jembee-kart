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
    <section className="w-full overflow-hidden px-3 py-5 md:px-6">

      <div className="grid w-full gap-5 md:grid-cols-2">

        {/* SELLER CARD */}

        <div className="w-full overflow-hidden rounded-[24px] bg-gradient-to-br from-indigo-600 to-purple-700 p-5 text-white shadow-2xl md:rounded-[50px] md:p-10">

          <div className="w-full min-w-0">

            <h2 className="break-words text-3xl font-black leading-tight md:text-6xl">
              {sellerTitle}
            </h2>

            <p className="mt-4 break-words text-base leading-relaxed text-indigo-100 md:mt-5 md:text-2xl">
              {sellerDescription}
            </p>

            <button className="mt-6 w-full rounded-2xl bg-white px-6 py-3 text-sm font-bold text-indigo-700 transition-all duration-300 hover:scale-[1.02] md:mt-8 md:w-auto md:px-12 md:py-5 md:text-base">
              {sellerButtonText}
            </button>

          </div>

        </div>

        {/* RESELLER CARD */}

        <div className="w-full overflow-hidden rounded-[24px] bg-gradient-to-br from-pink-500 to-rose-600 p-5 text-white shadow-2xl md:rounded-[50px] md:p-10">

          <div className="w-full min-w-0">

            <h2 className="break-words text-3xl font-black leading-tight md:text-6xl">
              {resellerTitle}
            </h2>

            <p className="mt-4 break-words text-base leading-relaxed text-pink-100 md:mt-5 md:text-2xl">
              {resellerDescription}
            </p>

            <button className="mt-6 w-full rounded-2xl bg-white px-6 py-3 text-sm font-bold text-rose-600 transition-all duration-300 hover:scale-[1.02] md:mt-8 md:w-auto md:px-12 md:py-5 md:text-base">
              {resellerButtonText}
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}
