"use client";

interface Product {
  id: number;

  name: string;

  price: string;
}

interface ProductSectionProps {
  products?: Product[];
}

export default function ProductSection({
  products = [
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
  ]
}: ProductSectionProps) {
  return (
    <section className="w-full overflow-hidden px-3 py-5 md:px-6">

      <div className="w-full overflow-hidden rounded-[24px] bg-white p-4 shadow-xl md:rounded-[40px] md:p-8">

        <div className="mb-6 flex items-center justify-between gap-3">

          <h2 className="break-words text-2xl font-black text-gray-800 sm:text-3xl md:text-5xl">
            Trending Products
          </h2>

          <button className="shrink-0 text-sm font-bold text-blue-600 md:text-base">
            Explore
          </button>

        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">

          {products.map((product) => {
            return (
              <div
                key={product.id}
                className="min-w-0 overflow-hidden rounded-[22px] border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >

                <div className="h-28 bg-gradient-to-br from-blue-100 to-purple-100 md:h-44" />

                <div className="p-3 md:p-4">

                  <h3 className="break-words text-sm font-bold text-gray-800 md:text-lg">
                    {product.name}
                  </h3>

                  <p className="mt-2 text-lg font-black text-blue-600 md:text-2xl">
                    {product.price}
                  </p>

                  <button className="mt-4 w-full rounded-2xl bg-blue-600 py-3 text-xs font-bold text-white transition-all duration-300 hover:bg-blue-700 md:text-base">
                    Add To Cart
                  </button>

                </div>

              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}
