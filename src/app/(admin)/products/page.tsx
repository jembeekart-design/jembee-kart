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

  // Firestore se data load karna
  const loadData = async () => {
    try {
      const snap = await getDocs(collection(db, "products"));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Firestore Error:", e);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 🔄 POORA SYNC AUR AUTO-SAVE LOGIC
  const syncFromQikink = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/qikink/sync');
      const result = await res.json();

      // Debugging ke liye alert
      alert("RAW RESPONSE: " + JSON.stringify(result.body));

      if (result.status === 200 && result.body.success !== false) {
        // Qikink API 'products' ya 'data' array bhejti hai
        const items = result.body.products || result.body.data || [];
        
        if (items.length > 0) {
          let addedCount = 0;

          for (const item of items) {
            const sku = String(item.product_id || item.id || item.sku);
            
            // Duplicate check
            const exists = products.find(p => p.sku === sku);
            
            if (!exists) {
              const basePrice = Number(item.product_price || item.price || 0);
              
              // Firestore mein automatic save
              await addDoc(collection(db, "products"), {
                name: item.product_name || item.name || "Qikink Product",
                sku: sku,
                basePrice: basePrice,
                margin: 150,
                finalPrice: basePrice + 150,
                image: item.product_image || item.image || "https://via.placeholder.com/150",
                source: "sandbox_sync",
                createdAt: serverTimestamp()
              });
              addedCount++;
            }
          }
          alert(`✅ Success! ${addedCount} naye products sync ho gaye.`);
          loadData();
        } else {
          alert("⚠️ Sandbox catalog khali hai.");
        }
      } else {
        alert("❌ API Error: " + (result.body.message || "Invalid Sandbox Keys"));
      }
    } catch (err) {
      alert("❌ Server connection fail ho gaya.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>📦 Qikink Sandbox Sync</h2>
        <button 
          onClick={syncFromQikink} 
          disabled={loading}
          style={{ 
            background: loading ? '#ccc' : '#e11d48', 
            color: 'white', 
            padding: '12px 24px', 
            border: 'none', 
            borderRadius: '10px', 
            cursor: 'pointer',
            fontWeight: 'bold' 
          }}
        >
          {loading ? "Syncing..." : "🚀 Sync Sandbox Products"}
        </button>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {products.length === 0 && <p style={{ color: '#888' }}>Inventory khali hai. Button dabayein.</p>}
        {products.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '15px', borderRadius: '15px', border: '1px solid #eee' }}>
            <img src={p.image} alt="" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
            <div style={{ flex: 1, marginLeft: '15px' }}>
              <div style={{ fontWeight: 'bold' }}>{p.name}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>SKU: {p.sku} | Customer Price: ₹{p.finalPrice}</div>
            </div>
            <button 
              onClick={async () => { if(confirm("Delete?")) { await deleteDoc(doc(db, "products", p.id)); loadData(); } }} 
              style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
