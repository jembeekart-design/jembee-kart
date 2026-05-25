"use client";

export default function CashbackPage() {

  const cashback = [
    {
      title: "Order Cashback",
      amount: 120
    },

    {
      title: "Special Reward",
      amount: 80
    }
  ];

  return (

    <main className="min-h-screen bg-slate-100 p-4">

      <h1 className="mb-5 text-3xl font-black">
        Cashback
      </h1>

      <div className="space-y-4">

        {cashback.map((item, index) => (

          <div
            key={index}
            className="
              rounded-3xl
              bg-white
              p-5
              shadow-sm
            "
          >

            <div className="flex items-center justify-between">

              <div>

                <h2 className="font-black">
                  {item.title}
                </h2>

                <p className="text-sm text-gray-500">
                  Cashback Reward
                </p>

              </div>

              <p className="text-2xl font-black text-green-600">

                ₹{item.amount}

              </p>

            </div>

          </div>
        ))}

      </div>

    </main>
  );
}
