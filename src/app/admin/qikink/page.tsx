'use client';

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; 
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";

export default function QikinkInventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { loadData(); }, []);

  const syncFromQikink = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/qikink/sync');
      const result = await res.json();

      console.log("FULL RESPONSE:", result);

      if (!result.success) {
        alert("❌ API Error");
        return;
      }

      // 🔥 SAFE DATA EXTRACTION
      const apiData = result.data || {};
      const items =
        apiData.products ||
        apiData.data ||
        apiData.items ||
        [];

      // ⚠️ अगर empty है
      if (items.length === 0) {
        alert("⚠️ No products found (Live API empty)");

        // 🔥 Dummy fallback (important)
        const dummy = [
          {
            product_name: "Demo T-Shirt",
            id: "demo1",
            price: 200,
            image: "https://via.placeholder.com/150",
          },
        ];

        for (const item of dummy) {
          await addDoc(collection(db, "products"), {
            name: item.product_name,
            sku: item.id,
            basePrice: item.price,
            finalPrice: item.price + 150,
            image: item.image,
            source: "fallback",
            createdAt: serverTimestamp(),
          });
        }

        loadData();
        return;
      }

      let added = 0;

      for (const item of items) {
        const sku = String(item.id || item.product_id || item.sku);

        const exists = products.find(p => p.sku === sku);
        if (exists) continue;

        const price = Number(item.price || item.product_price || 0);

        await addDoc(collection(db, "products"), {
          name: item.name || item.product_name || "Qikink Product",
          sku,
          basePrice: price,
          finalPrice: price + 150,
          image: item.image || item.product_image || "https://via.placeholder.com/150",
          source: "qikink_live",
          createdAt: serverTimestamp(),
        });

        added++;
      }

      alert(`✅ ${added} products synced`);
      loadData();

    } catch (err) {
      alert("❌ Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📦 Qikink Live Sync</h2>

      <button onClick={syncFromQikink} disabled={loading}>
        {loading ? "Syncing..." : "🚀 Sync Products"}
      </button>

      <div style={{ marginTop: 20 }}>
        {products.map(p => (
          <div key={p.id}>
            {p.name} - ₹{p.finalPrice}
          </div>
        ))}
      </div>
    </div>
  );
}
