'use client';

import { useEffect, useState } from "react";

type Offer = {
  id: string;
  code: string;
  discount: number;
  expiry: string;
  active: boolean;
};

export default function OffersPage() {
  const [themeColor, setThemeColor] = useState("#6366f1");

  const [offers, setOffers] = useState<Offer[]>([]);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(10);
  const [expiry, setExpiry] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);

    // Dummy data (replace with Firestore)
    setOffers([
      {
        id: "1",
        code: "SAVE10",
        discount: 10,
        expiry: "2025-04-30",
        active: true,
      },
    ]);
  }, []);

  const addOffer = () => {
    if (!code) return;

    const newOffer: Offer = {
      id: Date.now().toString(),
      code,
      discount,
      expiry,
      active: true,
    };

    setOffers((prev) => [...prev, newOffer]);
    setCode("");
    setDiscount(10);
    setExpiry("");
  };

  const toggleActive = (id: string) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, active: !o.active } : o
      )
    );
  };

  const deleteOffer = (id: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <div className="space-y-6 text-white">
      {/* Title */}
      <h1 className="text-3xl font-bold">🎟 Offers & Coupons</h1>

      {/* Create Offer */}
      <div className="glass p-5 rounded-2xl grid md:grid-cols-4 gap-3">
        <input
          type="text"
          placeholder="Coupon Code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="p-3 rounded-xl bg-white/10 border border-white/20"
        />

        <input
          type="number"
          placeholder="Discount %"
          value={discount}
          onChange={(e) => setDiscount(Number(e.target.value))}
          className="p-3 rounded-xl bg-white/10 border border-white/20"
        />

        <input
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="p-3 rounded-xl bg-white/10 border border-white/20"
        />

        <button
          onClick={addOffer}
          className="rounded-xl font-medium"
          style={{
            background: themeColor,
            boxShadow: `0 0 20px ${themeColor}55`,
          }}
        >
          Add
        </button>
      </div>

      {/* Offer List */}
      <div className="glass p-5 rounded-2xl space-y-3">
        {offers.length === 0 && (
          <p className="opacity-50 text-sm">
            No offers created
          </p>
        )}

        {offers.map((offer) => (
          <div
            key={offer.id}
            className="flex justify-between items-center border-b border-white/10 pb-2"
          >
            <div>
              <p className="font-semibold">{offer.code}</p>
              <p className="text-sm opacity-70">
                {offer.discount}% OFF • Exp: {offer.expiry}
              </p>
            </div>

            <div className="flex gap-2">
              {/* Toggle */}
              <button
                onClick={() => toggleActive(offer.id)}
                className={`px-3 py-1 rounded-full text-xs ${
                  offer.active
                    ? "bg-green-500/30 text-green-400"
                    : "bg-red-500/30 text-red-400"
                }`}
              >
                {offer.active ? "Active" : "Inactive"}
              </button>

              {/* Delete */}
              <button
                onClick={() => deleteOffer(offer.id)}
                className="px-3 py-1 rounded-lg text-xs bg-red-500/30 text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="glass p-4 rounded-xl text-sm opacity-70">
        Coupons can be applied at checkout. Only active and valid offers will work.
      </div>
    </div>
  );
}
