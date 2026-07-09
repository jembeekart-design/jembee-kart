"use client";

export default function FooterSection() {
  return (
    <footer className="w-full overflow-hidden bg-gray-900 text-[var(--button-text-color)]">

      <div className="grid w-full gap-10 px-4 py-12 md:grid-cols-2 md:px-6 lg:grid-cols-4">

        {/* BRAND */}

        <div className="min-w-0">

          <h2 className="break-words text-3xl font-black theme-primary-text md:text-4xl">
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

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              Home
            </li>

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              Products
            </li>

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              Affiliate
            </li>

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
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

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              Help Center
            </li>

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              Refund Policy
            </li>

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              Privacy Policy
            </li>

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
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

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              Seller Program
            </li>

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              Affiliate System
            </li>

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              MLM Network
            </li>

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              AI Automation
            </li>

          </ul>

        </div>

      </div>

      {/* COPYRIGHT */}

      <div className="border-t border-gray-800 px-4 py-5 text-center text-sm text-[var(--muted-text-color)] md:text-base">

        © 2026 JembeeKart. All rights reserved.

      </div>

    </footer>
  );
}
