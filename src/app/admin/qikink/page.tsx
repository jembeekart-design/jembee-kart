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

  // 🔄 Load Firestore data
  const loadData = async () => {
    try {
      const snap = await getDocs(collection(db, "products"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(list);
    } catch (e) {
      console.error("Firestore Load Error:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🚀 SYNC FUNCTION
  const syncFromQikink = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/qikink/sync");

      console.log("🌐 STATUS:", res.status);

      const result = await res.json();

      console.log("🔥 FULL RESPONSE:", result);

      // 🔥 DEBUG ALERT (VERY IMPORTANT)
      alert(JSON.stringify(result, null, 2));

      if (!result.success) {
        alert("❌ API Error: " + (result.error || "Unknown error"));
        return;
      }

      // 📦 SAFE EXTRACTION
      const apiData = result.data || {};
      const items =
        apiData.products ||
        apiData.data ||
        apiData.items ||
        [];

      console.log("📦 ITEMS:", items);

      // ⚠️ EMPTY CASE
      if (items.length === 0) {
        alert("⚠️ No products found");

        // 🔥 Dummy fallback
        const dummy = [
          {
            name: "Demo T-Shirt",
            sku: "demo1",
            price: 200,
            image: "https://via.placeholder.com/150",
          },
        ];

        for (const item of dummy) {
          await addDoc(collection(db, "products"), {
            name: item.name,
            sku: item.sku,
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

      // ✅ SAVE PRODUCTS
      let added = 0;

      for (const item of items) {
        const sku = String(item.id || item.product_id || item.sku);

        // Duplicate check
        const exists = products.find(p => p.sku === sku);
        if (exists) continue;

        const price = Number(item.price || item.product_price || 0);

        await addDoc(collection(db, "products"), {
          name: item.name || item.product_name || "Qikink Product",
          sku,
          basePrice: price,
          finalPrice: price + 150,
          image:
            item.image ||
            item.product_image ||
            "https://via.placeholder.com/150",
          source: "qikink_live",
          createdAt: serverTimestamp(),
        });

        added++;
      }

      alert(`✅ ${added} products synced`);
      loadData();

    } catch (err: any) {
      console.error("❌ ERROR:", err);
      alert("❌ Server error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ DELETE
  const deleteProduct = async (id: string) => {
    if (!confirm("Delete product?")) return;

    await deleteDoc(doc(db, "products", id));
    loadData();
  };

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h2>📦 Qikink Live Sync</h2>

      <button
        onClick={syncFromQikink}
        disabled={loading}
        style={{
          padding: "10px 20px",
          background: "#6366f1",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        {loading ? "Syncing..." : "🚀 Sync Products"}
      </button>

      {/* 📦 Product List */}
      <div style={{ marginTop: 20 }}>
        {products.length === 0 && (
          <p style={{ color: "#888" }}>No products yet</p>
        )}

        {products.map(p => (
          <div
            key={p.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 15,
              padding: 10,
              border: "1px solid #eee",
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <img
              src={p.image}
              alt=""
              style={{
                width: 60,
                height: 60,
                objectFit: "cover",
                borderRadius: 8,
              }}
            />

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold" }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "#666" }}>
                SKU: {p.sku} | ₹{p.finalPrice}
              </div>
            </div>

            <button
              onClick={() => deleteProduct(p.id)}
              style={{
                border: "none",
                background: "none",
                color: "red",
                cursor: "pointer",
              }}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
