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

export default function QikinkInventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // 1. Load Data from Firestore
  const loadData = async () => {
    try {
      const snap = await getDocs(collection(db, "products"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(list);
    } catch (e) {
      console.error("Firestore Load Error:", e);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 2. Real Sync Logic using API Keys
  const syncFromQikink = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/qikink/sync');
      const data = await res.json();

      if (data && data.products) {
        for (const item of data.products) {
          // Duplicate check by SKU
          const exists = products.find(p => p.sku === item.sku);
          
          if (!exists) {
            await addDoc(collection(db, "products"), {
              name: item.name,
              sku: item.sku,
              basePrice: Number(item.price),
              image: item.image_url || "https://via.placeholder.com/150",
              margin: 150, // Default margin
              finalPrice: Number(item.price) + 150,
              source: "qikink",
              createdAt: serverTimestamp()
            });
          }
        }
        alert("✅ Real Products Synced!");
        loadData();
      } else {
        alert("⚠️ No products found in your Qikink account.");
      }
    } catch (err) {
      alert("❌ Sync Failed. Check API Route.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Update Margin
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

  // 4. Delete Product
  const handleDelete = async (id: string) => {
    if (window.confirm("Hamesha ke liye delete karein?")) {
      await deleteDoc(doc(db, "products", id));
      loadData();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #eee' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>📦 Qikink Inventory</h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Manage your synced products</p>
        </div>
        <button 
          onClick={syncFromQikink} 
          disabled={loading}
          style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}
        >
          {loading ? "🔄 Syncing..." : "Sync Real Products"}
        </button>
      </div>

      {/* Products Table */}
      <div style={{ background: '#fff', borderRadius: '15px', border: '1px solid #eee', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', color: '#666', borderBottom: '1px solid #eee' }}>PRODUCT</th>
              <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', color: '#666', borderBottom: '1px solid #eee' }}>SKU</th>
              <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', color: '#666', borderBottom: '1px solid #eee' }}>BASE</th>
              <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', color: '#666', borderBottom: '1px solid #eee' }}>MARGIN</th>
              <th style={{ padding: '15px', textAlign: 'left', fontSize: '12px', color: '#666', borderBottom: '1px solid #eee' }}>FINAL</th>
              <th style={{ padding: '15px', textAlign: 'right', fontSize: '12px', color: '#666', borderBottom: '1px solid #eee' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>No products found. Click Sync to start.</td></tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f4f4f4' }}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={p.image} style={{ width: '40px', height: '40px', borderRadius: '5px', objectFit: 'cover' }} alt="" />
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '15px', fontSize: '12px', color: '#888' }}>{p.sku}</td>
                  <td style={{ padding: '15px', fontSize: '14px' }}>₹{p.basePrice}</td>
                  <td style={{ padding: '15px' }}>
                    {editId === p.id ? (
                      <input 
                        type="number" 
                        defaultValue={p.margin}
                        onBlur={(e) => handleUpdate(p.id, Number(e.target.value), p.basePrice)}
                        style={{ width: '70px', padding: '5px', borderRadius: '5px', border: '1px solid #6366f1' }}
                        autoFocus
                      />
                    ) : (
                      <span 
                        onClick={() => setEditId(p.id)} 
                        style={{ color: '#6366f1', cursor: 'pointer', fontWeight: 'bold', borderBottom: '1px dashed #6366f1' }}
                      >
                        ₹{p.margin}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '15px', fontWeight: '900', fontSize: '16px' }}>₹{p.finalPrice}</td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                    >
                      DELETE
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
