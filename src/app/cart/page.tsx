/* ======================================================
FILE:
src/app/cart/page.tsx

FEATURES:

✅ Modern Cart UI
✅ Quantity Increase/Decrease
✅ Remove Product
✅ Cart Total
✅ Discount Price
✅ Gradient Checkout Button
✅ Firebase Ready
✅ Mobile Responsive
✅ Bottom Navbar
✅ WhatsApp Floating Button
====================================================== */

"use client";

import { useState } from "react";

import Image from "next/image";

import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2
} from "lucide-react";

import Header from "@/components/navigation/Header";

import BottomNavbar from "@/components/navigation/BottomNavbar";

import WhatsAppButton from "@/components/navigation/WhatsAppButton";

/* ======================================================
TYPES
====================================================== */

interface CartProduct {

  id: string;

  title: string;

  category: string;

  image: string;

  price: number;

  discountPrice?: number;

  quantity: number;
}

/* ======================================================
COMPONENT
====================================================== */

export default function CartPage() {

  /* ======================================================
  STATES
  ====================================================== */

  const [
    cartItems,
    setCartItems
  ] = useState<CartProduct[]>([

    {
      id: "1",

      title:
        "Premium Oversized T-Shirt",

      category:
        "Fashion",

      image:
        "https://placehold.co/600x600",

      price: 1499,

      discountPrice: 999,

      quantity: 1
    },

    {
      id: "2",

      title:
        "Streetwear Hoodie",

      category:
        "Hoodie",

      image:
        "https://placehold.co/600x600",

      price: 2499,

      discountPrice: 1899,

      quantity: 2
    }

  ]);

  /* ======================================================
  QUANTITY
  ====================================================== */

  function increaseQuantity(
    id: string
  ) {

    setCartItems(

      cartItems.map(
        (item) =>

          item.id === id

            ? {
                ...item,
                quantity:
                  item.quantity + 1
              }

            : item
      )
    );
  }

  function decreaseQuantity(
    id: string
  ) {

    setCartItems(

      cartItems.map(
        (item) =>

          item.id === id

            ? {
                ...item,
                quantity:
                  item.quantity > 1

                    ? item.quantity - 1

                    : 1
              }

            : item
      )
    );
  }

  /* ======================================================
  REMOVE ITEM
  ====================================================== */

  function removeItem(
    id: string
  ) {

    setCartItems(

      cartItems.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  /* ======================================================
  TOTALS
  ====================================================== */

  const subtotal =
    cartItems.reduce(

      (total, item) =>

        total +

        (
          item.discountPrice ||
          item.price
        ) *
          item.quantity,

      0
    );

  const shipping =
    subtotal > 0 ? 99 : 0;

  const total =
    subtotal + shipping;

  /* ======================================================
  UI
  ====================================================== */

  return (

    <main
      className="
        min-h-screen
        overflow-x-hidden
        bg-[#f6f7fb]
        pb-40
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
          pt-5
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

              My Cart

            </h1>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
              "
            >

              {
                cartItems.length
              }
              {" "}
              items in cart

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

            <ShoppingBag
              size={24}
            />

          </div>

        </div>

      </section>

      {/* ======================================================
      EMPTY CART
      ====================================================== */}

      {cartItems.length === 0 && (

        <section
          className="
            px-4
            pt-20
          "
        >

          <div
            className="
              rounded-[35px]
              bg-white
              p-10
              text-center
              shadow-sm
            "
          >

            <div
              className="
                mx-auto
                flex
                h-24
                w-24
                items-center
                justify-center
                rounded-full
                bg-gray-100
              "
            >

              🛒

            </div>

            <h2
              className="
                mt-6
                text-2xl
                font-black
                text-black
              "
            >

              Cart Is Empty

            </h2>

            <p
              className="
                mt-2
                text-sm
                text-gray-500
              "
            >

              Add products to continue shopping

            </p>

          </div>

        </section>

      )}

      {/* ======================================================
      CART ITEMS
      ====================================================== */}

      <section
        className="
          mt-6
          space-y-5
          px-4
        "
      >

        {cartItems.map(
          (item) => {

            return (

              <div
                key={
                  item.id
                }

                className="
                  overflow-hidden
                  rounded-[35px]
                  bg-white
                  p-4
                  shadow-sm
                "
              >

                <div
                  className="
                    flex
                    gap-4
                  "
                >

                  {/* IMAGE */}

                  <div
                    className="
                      relative
                      h-28
                      w-28
                      shrink-0
                      overflow-hidden
                      rounded-[28px]
                      bg-gray-100
                    "
                  >

                    <Image
                      src={
                        item.image
                      }

                      alt={
                        item.title
                      }

                      fill

                      className="
                        object-cover
                      "
                    />

                  </div>

                  {/* CONTENT */}

                  <div
                    className="
                      flex-1
                    "
                  >

                    <p
                      className="
                        text-[11px]
                        font-black
                        uppercase
                        tracking-[1px]
                        text-indigo-600
                      "
                    >

                      {
                        item.category
                      }

                    </p>

                    <h3
                      className="
                        mt-2
                        text-lg
                        font-black
                        leading-6
                        text-black
                      "
                    >

                      {
                        item.title
                      }

                    </h3>

                    {/* PRICE */}

                    <div
                      className="
                        mt-3
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <p
                        className="
                          text-2xl
                          font-black
                          text-black
                        "
                      >

                        ₹
                        {
                          item.discountPrice ||
                          item.price
                        }

                      </p>

                      {item.discountPrice && (

                        <p
                          className="
                            text-sm
                            font-bold
                            text-gray-400
                            line-through
                          "
                        >

                          ₹
                          {
                            item.price
                          }

                        </p>

                      )}

                    </div>

                    {/* ACTIONS */}

                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        justify-between
                      "
                    >

                      {/* QUANTITY */}

                      <div
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-2xl
                          bg-gray-100
                          px-3
                          py-2
                        "
                      >

                        <button
                          onClick={() =>
                            decreaseQuantity(
                              item.id
                            )
                          }
                        >

                          <Minus
                            size={16}
                          />

                        </button>

                        <p
                          className="
                            min-w-[20px]
                            text-center
                            text-sm
                            font-black
                          "
                        >

                          {
                            item.quantity
                          }

                        </p>

                        <button
                          onClick={() =>
                            increaseQuantity(
                              item.id
                            )
                          }
                        >

                          <Plus
                            size={16}
                          />

                        </button>

                      </div>

                      {/* DELETE */}

                      <button

                        onClick={() =>
                          removeItem(
                            item.id
                          )
                        }

                        className="
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-2xl
                          bg-red-50
                          text-red-500
                        "
                      >

                        <Trash2
                          size={18}
                        />

                      </button>

                    </div>

                  </div>

                </div>

              </div>

            );

          }
        )}

      </section>

      {/* ======================================================
      BILL DETAILS
      ====================================================== */}

      {cartItems.length > 0 && (

        <section
          className="
            mt-8
            px-4
          "
        >

          <div
            className="
              rounded-[35px]
              bg-white
              p-5
              shadow-sm
            "
          >

            <h2
              className="
                text-xl
                font-black
                text-black
              "
            >

              Bill Details

            </h2>

            {/* SUBTOTAL */}

            <div
              className="
                mt-5
                flex
                items-center
                justify-between
              "
            >

              <p
                className="
                  text-sm
                  font-medium
                  text-gray-500
                "
              >

                Subtotal

              </p>

              <p
                className="
                  text-sm
                  font-black
                  text-black
                "
              >

                ₹
                {
                  subtotal
                }

              </p>

            </div>

            {/* SHIPPING */}

            <div
              className="
                mt-4
                flex
                items-center
                justify-between
              "
            >

              <p
                className="
                  text-sm
                  font-medium
                  text-gray-500
                "
              >

                Shipping

              </p>

              <p
                className="
                  text-sm
                  font-black
                  text-black
                "
              >

                ₹
                {
                  shipping
                }

              </p>

            </div>

            {/* TOTAL */}

            <div
              className="
                mt-5
                flex
                items-center
                justify-between
                border-t
                border-dashed
                border-gray-200
                pt-5
              "
            >

              <p
                className="
                  text-lg
                  font-black
                  text-black
                "
              >

                Total

              </p>

              <p
                className="
                  text-2xl
                  font-black
                  text-indigo-600
                "
              >

                ₹
                {
                  total
                }

              </p>

            </div>

            {/* CHECKOUT BUTTON */}

            <button
              className="
                mt-6
                w-full
                rounded-[25px]
                bg-gradient-to-r
                from-indigo-600
                to-purple-600
                py-4
                text-sm
                font-black
                text-white
                shadow-xl
                transition-all
                duration-300

                hover:scale-[1.02]
              "
            >

              Proceed To Checkout

            </button>

          </div>

        </section>

      )}

      {/* ======================================================
      FLOATING BUTTONS
      ====================================================== */}

      <WhatsAppButton />

      <BottomNavbar />

    </main>

  );

}
