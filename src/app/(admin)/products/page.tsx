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

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Firestore se existing data load karna
  const loadData = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { loadData(); }, []);

  // 🔄 MAIN SYNC LOGIC
  const syncFromQikink = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/qikink/sync');
      const result = await res.json();

      // Qikink v1 format handling (data array check)
      const items = result.products || result.data || (Array.isArray(result) ? result : []);

      if (items.length > 0) {
        let newCount = 0;
        for (const item of items) {
          // Dashboard Product ID ko SKU ki tarah use karna
          const sku = String(item.product_id || item.id || item.sku);
          
          // Duplicate check
          const isDuplicate = products.find(p => p.sku === sku);
          
          if (!isDuplicate) {
            const basePrice = Number(item.product_price || item.price || 0);
            
            await addDoc(collection(db, "products"), {
              name: item.product_name || item.name || "Qikink Product",
              sku: sku,
              basePrice: basePrice,
              margin: 150,
              finalPrice: basePrice + 150,
              image: item.product_image || item.image || "https://via.placeholder.com/150",
              source: "qikink_sync",
              createdAt: serverTimestamp()
            });
            newCount++;
          }
        }
        alert(`✅ Sync Success! ${newCount} naye products mile.`);
        loadData();
      } else {
        alert("⚠️ Dashboard par products 'Active' hain par API empty response de rahi hai.");
      }
    } catch (err) {
      alert("❌ Sync Failed: Connection Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>📦 Inventory Sync</h2>
        <button 
          onClick={syncFromQikink} 
          disabled={loading}
          style={{ 
            background: loading ? '#ccc' : '#4f46e5', 
            color: 'white', 
            padding: '12px 24px', 
            border: 'none', 
            borderRadius: '10px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? "Syncing Data..." : "🔄 Sync from Qikink"}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {products.length === 0 && <p style={{ color: '#888' }}>Koi products nahi hain. Sync button dabayein.</p>}
        {products.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '15px', borderRadius: '15px', border: '1px solid #eee' }}>
            <img src={p.image} alt="" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
            <div style={{ flex: 1, marginLeft: '15px' }}>
              <div style={{ fontWeight: 'bold' }}>{p.name}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>SKU: {p.sku} | Price: ₹{p.finalPrice}</div>
            </div>
            <button onClick={async () => { if(confirm("Delete?")) { await deleteDoc(doc(db, "products", p.id)); loadData(); } }} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}
