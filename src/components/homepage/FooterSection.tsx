"use client";

import Link from "next/link";

export default function FooterSection() {
  return (
    <footer className="w-full overflow-hidden bg-[var(--card-color)] text-[var(--button-text-color)]">

      <div className="grid w-full gap-10 px-4 py-12 md:grid-cols-2 md:px-6 lg:grid-cols-4">

        {/* BRAND */}

        <div className="min-w-0">

          <h2 className="break-words text-3xl font-black theme-primary-text md:text-4xl">
            JembeeKart
          </h2>

          <p className="mt-4 break-words text-sm leading-relaxed text-[var(--muted-text-color)] md:text-lg">
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

          <ul className="mt-5 space-y-3 text-sm text-[var(--muted-text-color)] md:text-lg">

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              <Link href="/" className="block">
                Home
              </Link>
            </li>

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              <Link href="/" className="block">
                Products
              </Link>
            </li>

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              <Link href="/affiliate" className="block">
                Affiliate
              </Link>
            </li>

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              <Link href="/mlm" className="block">
                Seller
              </Link>
            </li>

          </ul>

        </div>

        {/* SUPPORT */}

        <div className="min-w-0">

          <h3 className="break-words text-2xl font-bold">
            Support
          </h3>

          <ul className="mt-5 space-y-3 text-sm text-[var(--muted-text-color)] md:text-lg">

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              <Link href="/mlm/support" className="block">
                Help Center
              </Link>
            </li>

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              <Link href="/refund-policy" className="block">
                Refund Policy
              </Link>
            </li>

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              <Link href="/privacy" className="block">
                Privacy Policy
              </Link>
            </li>

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              <Link href="/terms_conditions" className="block">
                Terms &amp; Conditions
              </Link>
            </li>

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              <Link href="/shipping" className="block">
                Shipping &amp; Delivery
              </Link>
            </li>

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              <Link href="/contact" className="block">
                Contact Us
              </Link>
            </li>

          </ul>

        </div>

        {/* BUSINESS */}

        <div className="min-w-0">

          <h3 className="break-words text-2xl font-bold">
            Business
          </h3>

          <ul className="mt-5 space-y-3 text-sm text-[var(--muted-text-color)] md:text-lg">

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              <Link href="/mlm" className="block">
                Seller Program
              </Link>
            </li>

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              <Link href="/affiliate" className="block">
                Affiliate System
              </Link>
            </li>

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              <Link href="/mlm/network" className="block">
                MLM Network
              </Link>
            </li>

            <li className="break-words transition-all duration-300 hover:text-[var(--button-text-color)]">
              <Link href="/mlm" className="block">
                AI Automation
              </Link>
            </li>

          </ul>

        </div>

      </div>

      {/* COPYRIGHT */}

      <div className="border-t border-[var(--border-color)] px-4 py-5 text-center text-sm text-[var(--muted-text-color)] md:text-base">

        © 2026 JembeeKart. All rights reserved.

      </div>

    </footer>
  );
}
