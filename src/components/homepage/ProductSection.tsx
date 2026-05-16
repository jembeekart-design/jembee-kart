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
    <section className="mx-auto max-w-7xl px-4 py-6 md:px-6">

      <div className="rounded-[30px] bg-white p-5 shadow-xl md:rounded-[40px] md:p-8">

        <div className="mb-8 flex items-center justify-between">

          <h2 className="text-2xl font-black text-gray-800 md:text-4xl">
            Trending Products
          </h2>

          <button className="font-bold text-blue-600">
            Explore
          </button>

        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">

          {products.map((product) => {
            return (
              <div
                key={product.id}
                className="overflow-hidden rounded-[25px] border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >

                <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 md:h-44" />

                <div className="p-4">

                  <h3 className="font-bold text-gray-800">
                    {product.name}
                  </h3>

                  <p className="mt-2 text-lg font-black text-blue-600 md:text-xl">
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
  );
}
