"use client";

import Link from "next/link";

export default function Homepage() {
  const categories = [
    "Fashion",
    "Electronics",
    "Beauty",
    "Shoes",
    "Mobiles",
    "Accessories",
    "Home",
    "Kids"
  ];

  const products = [
    {
      id: 1,
      name: "Premium Hoodie",
      price: "₹999"
    },
    {
      id: 2,
      name: "Wireless Earbuds",
      price: "₹1499"
    },
    {
      id: 3,
      name: "Smart Watch",
      price: "₹2499"
    },
    {
      id: 4,
      name: "Sneakers",
      price: "₹1999"
    },
    {
      id: 5,
      name: "Beauty Kit",
      price: "₹799"
    },
    {
      id: 6,
      name: "Bluetooth Speaker",
      price: "₹1299"
    }
  ];

  return (
    <main className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

          <div>
            <h1 className="text-3xl font-black text-blue-600">
              JembeeKart
            </h1>

            <p className="text-xs text-gray-500">
              AI Ecommerce Ecosystem
            </p>
          </div>

          <div className="hidden gap-6 md:flex">
            <Link
              href="/"
              className="font-semibold text-gray-700 hover:text-blue-600"
            >
              Home
            </Link>

            <Link
              href="/products"
              className="font-semibold text-gray-700 hover:text-blue-600"
            >
              Products
            </Link>

            <Link
              href="/affiliate"
              className="font-semibold text-gray-700 hover:text-blue-600"
            >
              Affiliate
            </Link>

            <Link
              href="/seller"
              className="font-semibold text-gray-700 hover:text-blue-600"
            >
              Seller
            </Link>
          </div>

        </div>
      </header>

      {/* HERO */}

      <section className="mx-auto max-w-7xl px-4 py-8">

        <div className="overflow-hidden rounded-[35px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl md:p-14">

          <div className="max-w-3xl">

            <h2 className="text-4xl font-black leading-tight md:text-6xl">
              Build Your Ecommerce Empire
            </h2>

            <p className="mt-6 text-lg text-blue-100">
              AI Powered Ecommerce, Affiliate Marketing,
              Reselling, MLM and Seller Ecosystem.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <button className="rounded-2xl bg-white px-6 py-3 font-bold text-blue-700 shadow-xl transition-all duration-300 hover:scale-105">
                Start Shopping
              </button>

              <button className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 font-bold backdrop-blur-xl transition-all duration-300 hover:bg-white/20">
                Become Seller
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* CATEGORIES */}

      <section className="mx-auto max-w-7xl px-4 py-4">

        <div className="rounded-[35px] bg-white p-6 shadow-xl">

          <div className="mb-6 flex items-center justify-between">

            <h2 className="text-3xl font-black text-gray-800">
              Categories
            </h2>

            <button className="font-bold text-blue-600">
              View All
            </button>

          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">

            {categories.map((category) => {
              return (
                <div
                  key={category}
                  className="cursor-pointer rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 p-5 text-center font-bold text-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {category}
                </div>
              );
            })}

          </div>

        </div>

      </section>

      {/* TRENDING PRODUCTS */}

      <section className="mx-auto max-w-7xl px-4 py-8">

        <div className="rounded-[35px] bg-white p-6 shadow-xl">

          <div className="mb-8 flex items-center justify-between">

            <h2 className="text-3xl font-black text-gray-800">
              Trending Products
            </h2>

            <button className="font-bold text-blue-600">
              Explore
            </button>

          </div>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">

            {products.map((product) => {
              return (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-[30px] border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >

                  <div className="h-44 bg-gradient-to-br from-blue-100 to-purple-100" />

                  <div className="p-4">

                    <h3 className="font-bold text-gray-800">
                      {product.name}
                    </h3>

                    <p className="mt-2 text-xl font-black text-blue-600">
                      {product.price}
                    </p>

                    <button className="mt-4 w-full rounded-2xl bg-blue-600 py-3 font-bold text-white transition-all duration-300 hover:bg-blue-700">
                      Add To Cart
                    </button>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </section>

      {/* AFFILIATE */}

      <section className="mx-auto max-w-7xl px-4 py-4">

        <div className="rounded-[35px] bg-gradient-to-r from-black to-gray-900 p-8 text-white shadow-2xl md:p-12">

          <div className="max-w-3xl">

            <h2 className="text-4xl font-black">
              Earn With Affiliate Marketing
            </h2>

            <p className="mt-5 text-lg text-gray-300">
              Share products, grow your team and earn
              daily passive income with JembeeKart.
            </p>

            <button className="mt-8 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-blue-700">
              Join Affiliate Program
            </button>

          </div>

        </div>

      </section>

      {/* SELLER */}

      <section className="mx-auto max-w-7xl px-4 py-8">

        <div className="grid gap-6 md:grid-cols-2">

          <div className="rounded-[35px] bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white shadow-2xl">

            <h2 className="text-3xl font-black">
              Become A Seller
            </h2>

            <p className="mt-4 text-indigo-100">
              Sell products with AI powered tools and
              advanced analytics.
            </p>

            <button className="mt-6 rounded-2xl bg-white px-6 py-3 font-bold text-indigo-700">
              Start Selling
            </button>

          </div>

          <div className="rounded-[35px] bg-gradient-to-br from-pink-500 to-rose-600 p-8 text-white shadow-2xl">

            <h2 className="text-3xl font-black">
              Reseller Program
            </h2>

            <p className="mt-4 text-pink-100">
              Start reselling without inventory and grow
              your online business.
            </p>

            <button className="mt-6 rounded-2xl bg-white px-6 py-3 font-bold text-rose-600">
              Join Now
            </button>

          </div>

        </div>

      </section>

      {/* AI TIPS */}

      <section className="mx-auto max-w-7xl px-4 py-4">

        <div className="rounded-[35px] bg-white p-8 shadow-xl">

          <h2 className="text-3xl font-black text-gray-800">
            AI Business Tips
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-3">

            {[
              "Use trending products daily",
              "Share products on WhatsApp",
              "Build passive affiliate income"
            ].map((tip) => {
              return (
                <div
                  key={tip}
                  className="rounded-3xl bg-gradient-to-br from-gray-900 to-black p-6 text-white shadow-xl"
                >
                  <h3 className="text-xl font-bold">
                    {tip}
                  </h3>
                </div>
              );
            })}

          </div>

        </div>

      </section>

      {/* WHATSAPP BUTTON */}

      <a
        href="https://wa.me/919999999999"
        target="_blank"
        className="fixed bottom-5 right-5 z-50 rounded-full bg-green-500 px-6 py-4 font-bold text-white shadow-2xl"
      >
        WhatsApp
      </a>

      {/* FOOTER */}

      <footer className="mt-10 bg-gray-900 text-white">

        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">

          <div>

            <h2 className="text-3xl font-black">
              JembeeKart
            </h2>

            <p className="mt-4 text-gray-400">
              AI Powered Ecommerce Ecosystem
            </p>

          </div>

          <div>

            <h3 className="text-xl font-bold">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-3 text-gray-400">
              <li>Home</li>
              <li>Products</li>
              <li>Affiliate</li>
              <li>Seller</li>
            </ul>

          </div>

          <div>

            <h3 className="text-xl font-bold">
              Support
            </h3>

            <ul className="mt-5 space-y-3 text-gray-400">
              <li>Help Center</li>
              <li>Refund Policy</li>
              <li>Privacy Policy</li>
              <li>Contact</li>
            </ul>

          </div>

          <div>

            <h3 className="text-xl font-bold">
              Business
            </h3>

            <ul className="mt-5 space-y-3 text-gray-400">
              <li>Seller Program</li>
              <li>Affiliate System</li>
              <li>MLM Network</li>
              <li>AI Automation</li>
            </ul>

          </div>

        </div>

        <div className="border-t border-gray-800 py-5 text-center text-gray-500">
          © 2026 JembeeKart. All rights reserved.
        </div>

      </footer>

    </main>
  );
}
