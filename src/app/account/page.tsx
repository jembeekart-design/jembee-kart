/* ======================================================
FILE:
src/app/account/page.tsx

FEATURES:

✅ Modern Account Page
✅ User Profile Card
✅ Wallet Balance
✅ Orders Button
✅ Wishlist Button
✅ Address Button
✅ Affiliate Button
✅ Logout Button
✅ Gradient UI
✅ Mobile Responsive
✅ Bottom Navbar
✅ WhatsApp Button
====================================================== */

"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";

import {
  ChevronRight,
  CreditCard,
  Gift,
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  Shield,
  User,
  Wallet
} from "lucide-react";

import Header from "@/components/navigation/Header";

import BottomNavbar from "@/components/navigation/BottomNavbar";

import WhatsAppButton from "@/components/navigation/WhatsAppButton";

/* ======================================================
COMPONENT
====================================================== */

export default function AccountPage() {

  /* ======================================================
  USER DATA
  ====================================================== */

  const user = {

    name:
      "MD Alim Ansari",

    email:
      "alimansari@gmail.com",

    phone:
      "+91 7061369212",

    wallet:
      12580
  };

  /* ======================================================
  MENU ITEMS
  ====================================================== */

  const menuItems = [

    {
      title:
        "My Orders",

      icon:
        Package,

      href:
        "/orders",

      color:
        "bg-indigo-100 text-indigo-600"
    },

    {
      title:
        "Wishlist",

      icon:
        Heart,

      href:
        "/wishlist",

      color:
        "bg-pink-100 text-pink-600"
    },

    {
      title:
        "Saved Address",

      icon:
        MapPin,

      href:
        "/address",

      color:
        "bg-orange-100 text-orange-600"
    },

    {
      title:
        "Affiliate Dashboard",

      icon:
        Gift,

      href:
        "/affiliate",

      color:
        "bg-purple-100 text-purple-600"
    },

    {
      title:
        "Payment Methods",

      icon:
        CreditCard,

      href:
        "/payments",

      color:
        "bg-green-100 text-green-600"
    },

    {
      title:
        "Account Settings",

      icon:
        Settings,

      href:
        "/settings",

      color:
        "bg-gray-100 text-gray-700"
    }

  ];

  /* ======================================================
  UI
  ====================================================== */

  return (

    <main
      className="
        min-h-screen
        overflow-x-hidden
        bg-[#f6f7fb]
        pb-32
        pt-[115px]

        md:pt-[150px]
      "
    >

      {/* ======================================================
      HEADER
      ====================================================== */}

      <Header />

      {/* ======================================================
      PAGE TITLE
      ====================================================== */}

      <section
        className="
          px-4
          pt-4
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
          "
        >

          <div>

            <h1
              className="
                text-3xl
                font-black
                text-black
              "
            >

              My Account

            </h1>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
              "
            >

              Manage your profile & orders

            </p>

          </div>

          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-3xl
              bg-gradient-to-br
              from-indigo-600
              to-purple-600
              text-white
              shadow-lg
            "
          >

            <User
              size={26}
            />

          </div>

        </div>

      </section>

      {/* ======================================================
      PROFILE CARD
      ====================================================== */}

      <section
        className="
          mt-6
          px-4
        "
      >

        <div
          className="
            overflow-hidden
            rounded-[35px]

            bg-gradient-to-br
            from-indigo-600
            via-purple-600
            to-pink-500

            p-6
            text-white
            shadow-2xl
          "
        >

          {/* TOP */}

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            {/* AVATAR */}

            <div
              className="
                flex
                h-24
                w-24
                items-center
                justify-center

                rounded-full

                border-4
                border-white/30

                bg-white/20

                text-3xl
                font-black

                backdrop-blur-md
              "
            >

              M

            </div>

            {/* USER INFO */}

            <div
              className="
                min-w-0
                flex-1
              "
            >

              <h2
                className="
                  truncate
                  text-2xl
                  font-black
                "
              >

                {
                  user.name
                }

              </h2>

              <p
                className="
                  mt-1
                  truncate
                  text-sm
                  text-white/80
                "
              >

                {
                  user.email
                }

              </p>

              <p
                className="
                  mt-1
                  text-sm
                  text-white/80
                "
              >

                {
                  user.phone
                }

              </p>

            </div>

          </div>

          {/* WALLET */}

          <div
            className="
              mt-6
              rounded-3xl
              bg-white/15
              p-5
              backdrop-blur-md
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    font-semibold
                    text-white/80
                  "
                >

                  Wallet Balance

                </p>

                <h3
                  className="
                    mt-2
                    text-4xl
                    font-black
                  "
                >

                  ₹
                  {
                    user.wallet
                  }

                </h3>

              </div>

              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center

                  rounded-full

                  bg-white/20
                "
              >

                <Wallet
                  size={30}
                />

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
      MENU SECTION
      ====================================================== */}

      <section
        className="
          mt-6
          px-4
        "
      >

        <div
          className="
            space-y-4
          "
        >

          {menuItems.map(
            (item) => {

              const Icon =
                item.icon;

              return (

                <Link
                  key={
                    item.title
                  }

                  href={
                    item.href
                  }

                  className="
                    flex
                    items-center
                    justify-between

                    rounded-[30px]
                    bg-white

                    p-5

                    shadow-sm

                    transition-all
                    duration-300

                    hover:scale-[1.01]
                  "
                >

                  {/* LEFT */}

                  <div
                    className="
                      flex
                      items-center
                      gap-4
                    "
                  >

                    <div
                      className={`
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center

                        rounded-2xl

                        ${item.color}
                      `}
                    >

                      <Icon
                        size={26}
                      />

                    </div>

                    <div>

                      <h3
                        className="
                          text-lg
                          font-black
                          text-black
                        "
                      >

                        {
                          item.title
                        }

                      </h3>

                    </div>

                  </div>

                  {/* RIGHT */}

                  <ChevronRight
                    size={22}
                    className="
                      text-gray-400
                    "
                  />

                </Link>

              );

            }
          )}

        </div>

      </section>

      {/* ======================================================
      SECURITY CARD
      ====================================================== */}

      <section
        className="
          mt-6
          px-4
        "
      >

        <div
          className="
            rounded-[35px]
            bg-white
            p-6
            shadow-sm
          "
        >

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center

                rounded-3xl

                bg-green-100
                text-green-600
              "
            >

              <Shield
                size={30}
              />

            </div>

            <div>

              <h3
                className="
                  text-xl
                  font-black
                  text-black
                "
              >

                Account Secure

              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >

                Your account is protected

              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
      LOGOUT BUTTON
      ====================================================== */}

      <section
        className="
          mt-6
          px-4
        "
      >

        <button
          className="
            flex
            w-full
            items-center
            justify-center
            gap-3

            rounded-[30px]

            bg-red-500

            py-5

            text-sm
            font-black
            text-white

            shadow-xl
            shadow-red-500/20

            transition-all
            duration-300

            hover:scale-[1.02]
          "
        >

          <LogOut
            size={20}
          />

          Logout

        </button>

      </section>

      {/* ======================================================
      FLOATING BUTTONS
      ====================================================== */}

      <WhatsAppButton />

      <BottomNavbar />

    </main>

  );

}
