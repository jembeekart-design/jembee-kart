"use client";

type Props = {
  order: {
    id: string;
    status: string;
    items: { name: string; price: number }[];
    address?: string;
  };
};

export const TrackOrderScreen = ({ order }: Props) => {
  const steps = [
    "Order Placed",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  const currentStep = steps.findIndex(
    (step) => step.toLowerCase() === order.status.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-bg text-text">

      <div className="container-custom py-6">

        {/* 🔥 TITLE */}
        <h1 className="heading mb-6">📦 Track Order</h1>

        {/* 🔥 ORDER INFO */}
        <div className="glass p-5 mb-6">
          <p className="text-sm opacity-70">Order ID</p>
          <p className="font-semibold">{order.id}</p>

          <p className="mt-3 text-sm opacity-70">Delivery Address</p>
          <p>{order.address || "Not provided"}</p>
        </div>

        {/* 🔥 TRACKING STEPS */}
        <div className="glass p-5 mb-6">

          <h2 className="font-semibold mb-4">Order Status</h2>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const isActive = index <= currentStep;

              return (
                <div key={step} className="flex items-center gap-3">
                  
                  {/* DOT */}
                  <div
                    className={`w-4 h-4 rounded-full ${
                      isActive ? "bg-green-500" : "bg-gray-500"
                    }`}
                  />

                  {/* STEP */}
                  <p className={isActive ? "text-white" : "text-gray-400"}>
                    {step}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

        {/* 🔥 ITEMS */}
        <div className="glass p-5">

          <h2 className="font-semibold mb-4">Items</h2>

          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div
                key={i}
                className="flex justify-between border-b border-white/10 pb-2"
              >
                <span>{item.name}</span>
                <span>₹{item.price}</span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
