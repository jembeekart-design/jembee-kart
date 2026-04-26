'use client';

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; 
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";

export default function QikinkInventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Inputs for Real Product Data
  const [pName, setPName] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pSku, setPSku] = useState("");
  const [pImg, setPImg] = useState(""); // Image URL ke liye

  const loadData = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { loadData(); }, []);

  const addProduct = async () => {
    if (!pName || !pPrice) return alert("Product Name aur Price zaroori hai!");
    setLoading(true);
    try {
      await addDoc(collection(db, "products"), {
        name: pName,
        sku: pSku || "QK-" + Math.floor(Math.random() * 1000),
        basePrice: Number(pPrice),
        margin: 150,
        finalPrice: Number(pPrice) + 150,
        image: pImg || "https://via.placeholder.com/150",
        createdAt: serverTimestamp()
      });
      // Clear inputs
      setPName(""); setPPrice(""); setPSku(""); setPImg("");
      alert("✅ Product Store mein add ho gaya!");
      loadData();
    } catch (e) { alert("Error adding product"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #ddd', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0, color: '#444' }}>📦 Add Real Product from Qikink</h3>
        
        <p style={{ fontSize: '12px', color: '#888' }}>Dashboard se details dekh kar yahan bhariye:</p>
        
        <input placeholder="Product Name (e.g. Unisex Classic Crew T-Shirt)" value={pName} onChange={(e)=>setPName(e.target.value)} style={inputStyle} />
        <input placeholder="Product Price (e.g. 191.60)" type="number" value={pPrice} onChange={(e)=>setPPrice(e.target.value)} style={inputStyle} />
        <input placeholder="Product ID / SKU (e.g. 63917376)" value={pSku} onChange={(e)=>setPSku(e.target.value)} style={inputStyle} />
        <input placeholder="Image URL (Dashboard se image link copy karein)" value={pImg} onChange={(e)=>setPImg(e.target.value)} style={inputStyle} />
        
        <button onClick={addProduct} disabled={loading} style={btnStyle}>
          {loading ? "Adding..." : "Confirm & Add to Store"}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ margin: '10px 0' }}>Current Store Inventory ({products.length})</h4>
        {products.map(p => (
          <div key={p.id} style={cardStyle}>
            <img src={p.image} alt={p.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
            <div style={{ flex: 1, marginLeft: '15px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{p.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>SKU: {p.sku} | Customer Price: <b>₹{p.finalPrice}</b></div>
            </div>
            <button onClick={async () => { if(confirm("Delete?")) { await deleteDoc(doc(db, "products", p.id)); loadData(); } }} style={{ color: '#ff4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '10px', border: '1px solid #ddd', boxSizing: 'border-box' as const };
const btnStyle = { width: '100%', padding: '14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' as const, cursor: 'pointer', fontSize: '16px' };
const cardStyle = { display: 'flex', alignItems: 'center', background: '#fff', padding: '12px', borderRadius: '15px', border: '1px solid #f0f0f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
