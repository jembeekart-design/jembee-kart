'use client';

import { useState } from "react";
import { db } from "@/lib/firebase"; // Database connection
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ImportQikinkPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [margin, setMargin] = useState(150);

  // 🎯 1. Smart Fetch Logic
  const fetchProduct = async () => {
    if (!url.includes("qikink.com/products/view/")) {
      alert("❌ Error: Please paste a specific Product VIEW URL, not the list page.");
      return;
    }

    setLoading(true);
    
    // Fake API Simulation (In production, use fetch('/api/qikink/fetch'))
    setTimeout(() => {
      // URL se ID nikaalne ka logic (Example: .../view/12345)
      const productId = url.split('/').pop(); 
      
      setProduct({
        id: productId,
        name: "Qikink Premium Apparel",
        price: 399,
        image: "https://via.placeholder.com/400", // Actual image will come from API
        sku: `QK-PROD-${productId}`,
      });
      setLoading(false);
    }, 1000);
  };

  // 💾 2. Save to Firestore Logic
  const saveToStore = async () => {
    if (!product) return;
    setLoading(true);

    try {
      await addDoc(collection(db, "products"), {
        name: product.name,
        sku: product.sku,
        basePrice: product.price,
        margin: Number(margin),
        finalPrice: product.price + Number(margin),
        image: product.image,
        source: "qikink",
        createdAt: serverTimestamp(),
      });

      alert("✅ Product synced to your Firebase Storefront!");
      setProduct(null);
      setUrl("");
    } catch (err) {
      console.error(err);
      alert("❌ Database Error: Check your Firebase permissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Qikink Integration</h1>

      {/* Input Area */}
      <div className="p-6 border rounded-xl bg-gray-50 dark:bg-white/5">
        <label className="block text-xs font-bold mb-2 uppercase">Qikink Product View Link</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste individual product URL here..."
            className="flex-1 p-3 rounded-lg border dark:bg-black"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button 
            onClick={fetchProduct}
            className="bg-indigo-600 px-6 py-2 rounded-lg text-white font-bold"
          >
            {loading ? "..." : "Fetch"}
          </button>
        </div>
      </div>

      {/* Preview & Save */}
      {product && (
        <div className="p-6 border rounded-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex gap-6">
             <img src={product.image} className="w-32 h-32 rounded-lg" alt="" />
             <div className="flex-1 space-y-4">
                <h3 className="text-xl font-bold">{product.name}</h3>
                <p className="text-sm">Base Price: <span className="font-bold">₹{product.price}</span></p>
                
                <div className="flex flex-col gap-1">
                  <label className="text-xs opacity-60 font-bold">Set Profit Margin (₹)</label>
                  <input 
                    type="number"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="p-2 border rounded bg-transparent"
                  />
                </div>

                <div className="text-lg font-black text-indigo-500">
                  Total Listing Price: ₹{product.price + margin}
                </div>

                <button 
                  onClick={saveToStore}
                  className="w-full bg-green-600 py-3 rounded-xl text-white font-bold uppercase tracking-widest"
                >
                  {loading ? "Saving..." : "Confirm & Push to Firebase"}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
