"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock3
} from "lucide-react";

const orders = [
  {
    id: "ORD-1001",

    product:
      "Nike Shoes",

    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff",

    price: 2499,

    status:
      "Delivered"
  },

  {
    id: "ORD-1002",

    product:
      "Smart Watch",

    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30",

    price: 3999,

    status:
      "Shipping"
  },

  {
    id: "ORD-1003",

    product:
      "Gaming Headphone",

    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",

    price: 1799,

    status:
      "Pending"
  }
];

export default function
OrdersPage() {

  return (

    <main
      className="
        min-h-screen
        bg-[#0f0f12]
        pb-24
      "
    >

      {/* TOP BAR */}

      <div
        className="
          sticky
          top-0
          z-50
          border-b
          border-white/10
          bg-[var(--card-color)]/70
          backdrop-blur-xl
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            px-4
            py-4
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <Link
              href="/mlm"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-[var(--card-color)]/10
                text-[var(--button-text-color)]
              "
            >

              <ArrowLeft
                size={18}
              />

            </Link>

            <div>

              <h1
                className="
                  text-2xl
                  font-black
                  text-[var(--button-text-color)]
                "
              >

                MLM Orders

              </h1>

              <p
                className="
                  text-xs
                  text-[var(--muted-text-color)]
                "
              >

                Your shopping orders

              </p>

            </div>

          </div>

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-r
              from-violet-600
              to-fuchsia-500
              text-[var(--button-text-color)]
            "
          >

            <Package
              size={22}
            />

          </div>

        </div>

      </div>

      {/* ORDERS */}

      <section
        className="
          space-y-4
          px-4
          pt-5
        "
      >

        {orders.map(
          (order) => (

            <div
              key={order.id}
              className="
                overflow-hidden
                rounded-[28px]
                border
                border-white/10
                bg-[#18181c]
                shadow-xl
              "
            >

              {/* IMAGE */}

              <img
                src={order.image}
                alt={order.product}
                className="
                  h-[220px]
                  w-full
                  object-cover
                "
              />

              {/* CONTENT */}

              <div
                className="
                  p-4
                "
              >

                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-3
                  "
                >

                  <div>

                    <h2
                      className="
                        text-xl
                        font-black
                        text-[var(--button-text-color)]
                      "
                    >

                      {order.product}

                    </h2>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-[var(--muted-text-color)]
                      "
                    >

                      Order ID:
                      {" "}
                      {order.id}

                    </p>

                  </div>

                  <div
                    className="
                      rounded-full
                      bg-violet-600/20
                      px-4
                      py-2
                      text-sm
                      font-bold
                      text-violet-400
                    "
                  >

                    ₹{order.price}

                  </div>

                </div>

                {/* STATUS */}

                <div
                  className="
                    mt-5
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    bg-[var(--card-color)]/30
                    px-4
                    py-4
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >

                    {order.status ===
                    "Delivered" ? (

                      <CheckCircle2
                        size={24}
                        className="
                          text-green-500
                        "
                      />

                    ) : order.status ===
                      "Shipping" ? (

                      <Truck
                        size={24}
                        className="
                          text-yellow-400
                        "
                      />

                    ) : (

                      <Clock3
                        size={24}
                        className="
                          text-orange-500
                        "
                      />

                    )}

                    <div>

                      <h3
                        className="
                          text-sm
                          font-black
                          text-[var(--button-text-color)]
                        "
                      >

                        {order.status}

                      </h3>

                      <p
                        className="
                          text-xs
                          text-[var(--muted-text-color)]
                        "
                      >

                        Latest order update

                      </p>

                    </div>

                  </div>

                  <button
                    className="
                      rounded-xl
                      bg-gradient-to-r
                      from-violet-600
                      to-fuchsia-500
                      px-4
                      py-2
                      text-xs
                      font-black
                      text-[var(--button-text-color)]
                    "
                  >

                    Track

                  </button>

                </div>

              </div>

            </div>
          )
        )}

      </section>

    </main>
  );
}
