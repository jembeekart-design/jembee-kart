'use client';

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; 
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";

// TypeScript Interface for Product
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
  const [editId, setEditId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const snap = await getDocs(collection(db, "products"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      setProducts(list);
    } catch (e) {
      console.error("Firebase Error:", e);
    }
  };

  useEffect(() => { loadData(); }, []);

  const syncFromQikink = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/qikink/sync');
      const result = await res.json();

      // Qikink API response format handling
      const items = result.products || result.data || (Array.isArray(result) ? result : []);

      if (items.length > 0) {
        for (const item of items) {
          const sku = item.sku || `QK-${item.product_id || item.id}`;
          const exists = products.find(p => p.sku === sku);
          
          if (!exists) {
            const price = Number(item.price || item.product_price || 0);
            await addDoc(collection(db, "products"), {
              name: item.name || item.product_name || "Qikink Product",
              sku: sku,
              basePrice: price,
              image: item.image || item.product_image || "https://via.placeholder.com/150",
              margin: 150,
              finalPrice: price + 150,
              source: "qikink",
              createdAt: serverTimestamp()
            });
          }
        }
        alert("✅ Sync Success!");
        loadData();
      } else {
        alert("⚠️ No products found in API response.");
      }
    } catch (err) {
      alert("❌ Sync Error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, newMargin: number, base: number) => {
    try {
      await updateDoc(doc(db, "products", id), {
        margin: newMargin,
        finalPrice: base + newMargin
      });
      setEditId(null);
      loadData();
    } catch (e) { alert("Update Failed"); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete karein?")) {
      await deleteDoc(doc(db, "products", id));
      loadData();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #ddd' }}>
        <h1 style={{ margin: 0 }}>📦 Qikink Inventory</h1>
        <button 
          onClick={syncFromQikink} 
          disabled={loading}
          style={{ background: '#6366f1', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
        >
          {loading ? "🔄 Syncing..." : "Sync Products"}
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #ddd', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8f9fa' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left' }}>PRODUCT</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>SKU</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>BASE</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>MARGIN</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>FINAL</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>{p.name}</td>
                <td style={{ padding: '15px', fontSize: '12px', color: '#666' }}>{p.sku}</td>
                <td style={{ padding: '15px' }}>₹{p.basePrice}</td>
                <td style={{ padding: '15px' }}>
                  {editId === p.id ? (
                    <input 
                      type="number" 
                      defaultValue={p.margin}
                      onBlur={(e) => handleUpdate(p.id, Number(e.target.value), p.basePrice)}
                      style={{ width: '60px' }}
                      autoFocus
                    />
                  ) : (
                    <span onClick={() => setEditId(p.id)} style={{ cursor: 'pointer', color: '#6366f1' }}>₹{p.margin} ✏️</span>
                  )}
                </td>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>₹{p.finalPrice}</td>
                <td style={{ padding: '15px', textAlign: 'right' }}>
                  <button onClick={() => handleDelete(p.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
