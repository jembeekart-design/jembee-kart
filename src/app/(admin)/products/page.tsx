'use client';

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; 
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";

interface Product {
  id: string;
  name: string;
  sku: string;
  basePrice: number;
  image: string;
  margin: number;
  finalPrice: number;
}

export default function QikinkInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [productUrl, setProductUrl] = useState(""); // Single Link Fetch ke liye

  const loadData = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
  };

  useEffect(() => { loadData(); }, []);

  // 1. Bulk Sync (Agar API allow kare)
  const syncAll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/qikink/sync');
      const result = await res.json();
      const items = result.data || result.products || [];

      if (items.length > 0) {
        for (const item of items) {
          await addDoc(collection(db, "products"), {
            name: item.name || item.product_name,
            sku: item.sku || `QK-${item.product_id}`,
            basePrice: Number(item.price || 0),
            margin: 150,
            finalPrice: Number(item.price || 0) + 150,
            image: item.image || "https://via.placeholder.com/150",
            createdAt: serverTimestamp()
          });
        }
        loadData();
      } else {
        alert("API Response empty. Link se fetch try karein.");
      }
    } catch (e) { alert("Sync Error"); }
    setLoading(false);
  };

  // 2. Single Product Fetch (Store ID ke bina)
  const fetchByUrl = async () => {
    if(!productUrl) return alert("URL paste karein");
    setLoading(true);
    // Yahan hum dummy save kar rahe hain, aap logic refine kar sakte hain
    try {
      await addDoc(collection(db, "products"), {
        name: "Manual Qikink Item",
        sku: "QK-MANUAL-" + Date.now(),
        basePrice: 399,
        margin: 150,
        finalPrice: 549,
        image: "https://via.placeholder.com/150",
        createdAt: serverTimestamp()
      });
      alert("Product Added!");
      loadData();
    } catch (e) { alert("Error adding product"); }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 10px 0' }}>📦 Import Qikink</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Paste Qikink Product URL" 
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} 
          />
          <button onClick={fetchByUrl} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px' }}>Fetch Details</button>
        </div>
        <hr style={{ margin: '20px 0', opacity: 0.2 }} />
        <button onClick={syncAll} disabled={loading} style={{ width: '100%', padding: '12px', background: '#f4f4f4', border: '1px solid #ddd', borderRadius: '8px' }}>
          {loading ? "Processing..." : "Bulk Sync from API"}
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #ddd', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8f9fa' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left' }}>Product</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Base</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Final</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>{p.name}</td>
                <td style={{ padding: '15px' }}>₹{p.basePrice}</td>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>₹{p.finalPrice}</td>
                <td style={{ padding: '15px', textAlign: 'right' }}>
                  <button onClick={async () => { await deleteDoc(doc(db, "products", p.id)); loadData(); }} style={{ color: 'red', border: 'none', background: 'none' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
