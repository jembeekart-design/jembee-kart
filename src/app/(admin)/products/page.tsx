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
  const [productUrl, setProductUrl] = useState("");

  const loadData = async () => {
    try {
      const snap = await getDocs(collection(db, "products"));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    } catch (e) {
      console.error("Firestore error:", e);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Is function ko dhyan se replace karein
  const fetchByUrl = async () => {
    if (!productUrl) return alert("Pehle URL paste karein!");
    
    setLoading(true); // "Processing..." shuru

    try {
      // Chunki Store ID nahi hai, hum yahan template data use kar rahe hain
      // Baad mein hum product scraping logic yahan daal sakte hain
      const newProduct = {
        name: "Qikink Custom T-Shirt",
        sku: "QK-" + Math.floor(Math.random() * 10000),
        basePrice: 399,
        margin: 150,
        finalPrice: 549,
        image: "https://via.placeholder.com/150",
        source: "manual_url",
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "products"), newProduct);
      
      setProductUrl(""); // Input clear karein
      alert("✅ Product successfully added to Firestore!");
      await loadData();
    } catch (error: any) {
      console.error("Error:", error);
      alert("❌ Error: " + error.message);
    } finally {
      setLoading(false); // "Processing..." hamesha band hoga
    }
  };

  return (
    <div style={{ padding: '15px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #eee', marginBottom: '20px', textAlign: 'center' }}>
         <h2 style={{ margin: '0 0 15px 0' }}>📦 Import Qikink</h2>
         <input 
            type="text" 
            placeholder="Paste Product URL here..." 
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '10px', boxSizing: 'border-box' }} 
          />
          <button 
            onClick={fetchByUrl} 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: loading ? '#ccc' : '#6366f1', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '10px', 
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "Processing..." : "Fetch Details"}
          </button>
      </div>

      {/* List Display */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {products.map(p => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid #f0f0f0' }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>{p.name}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>Base: ₹{p.basePrice} | Final: ₹{p.finalPrice}</div>
            </div>
            <button 
              onClick={async () => { await deleteDoc(doc(db, "products", p.id)); loadData(); }}
              style={{ color: '#ff4444', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
