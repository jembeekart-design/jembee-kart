"use client";

export default function FooterSection() {
  return (
    <footer className="mt-10 bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">

        <h2 className="text-3xl font-black text-blue-400">
          JembeeKart
        </h2>

        <p className="mt-4 text-gray-400">
          AI Powered Ecommerce Ecosystem
        </p>

        <div className="mt-10 grid grid-cols-2 gap-8">

          <div>
            <h3 className="text-xl font-bold">
              Quick Links
            </h3>

            <ul className="mt-4 space-y-3 text-gray-400">
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

            <ul className="mt-4 space-y-3 text-gray-400">
              <li>Help Center</li>
              <li>Refund Policy</li>
              <li>Privacy Policy</li>
              <li>Contact</li>
            </ul>
          </div>

        </div>

        <div className="mt-10 border-t border-gray-800 pt-5 text-center text-sm text-gray-500">
          © 2026 JembeeKart
        </div>

      </div>
    </footer>
  );
}
