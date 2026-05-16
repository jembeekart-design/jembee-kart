"use client";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        
        <div>
          <h1 className="text-3xl font-bold text-blue-600">
            JembeeKart
          </h1>

          <p className="text-sm text-gray-500">
            AI Ecommerce Ecosystem
          </p>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <button className="rounded-2xl bg-gray-100 px-5 py-2 font-medium text-gray-700 transition-all duration-300 hover:bg-gray-200">
            Login
          </button>

          <button className="rounded-2xl bg-blue-600 px-5 py-2 font-medium text-white transition-all duration-300 hover:bg-blue-700">
            Become Seller
          </button>
        </div>
      </div>
    </header>
  );
}
