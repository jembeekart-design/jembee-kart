'use client';

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

export default function QikinkInventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔄 Load Firestore Data
  const loadData = async () => {
    try {
      const snap = await getDocs(collection(db, "products"));

      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setProducts(data);
    } catch (e) {
      console.error("Firestore Error:", e);
      alert("❌ Firestore load error");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🚀 Sync from Qikink
  const syncFromQikink = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/qikink/sync");

      let result;
      try {
        result = await res.json();
      } catch {
        throw new Error("Invalid JSON response");
      }

      console.log("API RESPONSE:", result);

      if (!res.ok) {
        throw new Error(result?.error || "API failed");
      }

      const items = result?.body?.products || result?.body?.data || [];

      if (!Array.isArray(items) || items.length === 0) {
        alert("⚠️ Sandbox catalog khali hai ya API data galat hai.");
        return;
      }

      let addedCount = 0;

      for (const item of items) {
        const sku = String(item.product_id || item.id || item.sku);

        if (!sku) continue;

        // 🔍 duplicate check
        const exists = products.some((p) => p.sku === sku);
        if (exists) continue;

        const basePrice = Number(item.product_price || item.price || 0);

        await addDoc(collection(db, "products"), {
          name: item.product_name || item.name || "Qikink Product",
          sku,
          basePrice,
          margin: 150,
          finalPrice: basePrice + 150,
          image:
            item.product_image ||
            item.image ||
            "https://via.placeholder.com/150",
          source: "qikink_sync",
          createdAt: serverTimestamp(),
        });

        addedCount++;
      }

      alert(`✅ ${addedCount} new products sync ho gaye`);
      loadData();

    } catch (err: any) {
      console.error(err);
      alert("❌ " + (err.message || "Sync failed"));
    } finally {
      setLoading(false);
    }
  };

  // 🗑 Delete product
  const deleteProduct = async (id: string) => {
    if (!confirm("Delete product?")) return;

    try {
      await deleteDoc(doc(db, "products", id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("❌ Delete failed");
    }
  };

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      {/* 🔥 Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2>📦 Qikink Sandbox Sync</h2>

        <button
          onClick={syncFromQikink}
          disabled={loading}
          style={{
            background: loading ? "#ccc" : "var(--primary)",
            color: "white",
            padding: "12px 24px",
            border: "none",
            borderRadius: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            boxShadow: "0 0 10px var(--primary)",
          }}
        >
          {loading ? "Syncing..." : "🚀 Sync Products"}
        </button>
      </div>

      {/* 📦 Product List */}
      <div style={{ display: "grid", gap: 15 }}>
        {products.length === 0 && (
          <p style={{ color: "#888" }}>
            Inventory khali hai. Sync button dabao.
          </p>
        )}

        {products.map((p) => (
          <div
            key={p.id}
            className="glass"
            style={{
              display: "flex",
              alignItems: "center",
              padding: 15,
              borderRadius: 15,
              gap: 15,
            }}
          >
            <img
              src={p.image}
              alt=""
              width={60}
              height={60}
              style={{
                borderRadius: 10,
                objectFit: "cover",
              }}
            />

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold" }}>{p.name}</div>

              <div style={{ fontSize: 13, opacity: 0.7 }}>
                SKU: {p.sku}
              </div>

              <div style={{ fontSize: 14 }}>
                ₹{p.finalPrice}
              </div>
            </div>

            <button
              onClick={() => deleteProduct(p.id)}
              style={{
                color: "red",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 18,
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
