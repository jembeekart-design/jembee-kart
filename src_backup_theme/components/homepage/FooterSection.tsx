"use client";

export default function FooterSection() {
  return (
    <footer className="w-full overflow-hidden bg-gray-900 text-white">

      <div className="grid w-full gap-10 px-4 py-12 md:grid-cols-2 md:px-6 lg:grid-cols-4">

        {/* BRAND */}

        <div className="min-w-0">

          <h2 className="break-words text-3xl font-black text-blue-400 md:text-4xl">
            JembeeKart
          </h2>

          <p className="mt-4 break-words text-sm leading-relaxed text-gray-400 md:text-lg">
            AI Powered Ecommerce Ecosystem with
            affiliate marketing, reseller system,
            MLM growth and seller automation.
          </p>

        </div>

        {/* QUICK LINKS */}

        <div className="min-w-0">

          <h3 className="break-words text-2xl font-bold">
            Quick Links
          </h3>

          <ul className="mt-5 space-y-3 text-sm text-gray-400 md:text-lg">

            <li className="break-words transition-all duration-300 hover:text-white">
              Home
            </li>

            <li className="break-words transition-all duration-300 hover:text-white">
              Products
            </li>

            <li className="break-words transition-all duration-300 hover:text-white">
              Affiliate
            </li>

            <li className="break-words transition-all duration-300 hover:text-white">
              Seller
            </li>

          </ul>

        </div>

        {/* SUPPORT */}

        <div className="min-w-0">

          <h3 className="break-words text-2xl font-bold">
            Support
          </h3>

          <ul className="mt-5 space-y-3 text-sm text-gray-400 md:text-lg">

            <li className="break-words transition-all duration-300 hover:text-white">
              Help Center
            </li>

            <li className="break-words transition-all duration-300 hover:text-white">
              Refund Policy
            </li>

            <li className="break-words transition-all duration-300 hover:text-white">
              Privacy Policy
            </li>

            <li className="break-words transition-all duration-300 hover:text-white">
              Contact Us
            </li>

          </ul>

        </div>

        {/* BUSINESS */}

        <div className="min-w-0">

          <h3 className="break-words text-2xl font-bold">
            Business
          </h3>

          <ul className="mt-5 space-y-3 text-sm text-gray-400 md:text-lg">

            <li className="break-words transition-all duration-300 hover:text-white">
              Seller Program
            </li>

            <li className="break-words transition-all duration-300 hover:text-white">
              Affiliate System
            </li>

            <li className="break-words transition-all duration-300 hover:text-white">
              MLM Network
            </li>

            <li className="break-words transition-all duration-300 hover:text-white">
              AI Automation
            </li>

          </ul>

        </div>

      </div>

      {/* COPYRIGHT */}

      <div className="border-t border-gray-800 px-4 py-5 text-center text-sm text-gray-500 md:text-base">

        © 2026 JembeeKart. All rights reserved.

      </div>

    </footer>
  );
}
