'use client';

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; 
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";

export default function QikinkInventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // 1. Firestore se data load karna
  const loadData = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "products"));
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { alert("Firebase Error!"); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // 2. Qikink Sync (Bulk Import Logic)
  const syncFromQikink = async () => {
    setLoading(true);
    // Ye mock data hai, Qikink API integrated hone par yahan real data aayega
    const items = [
      { name: "Qikink T-Shirt", price: 399, sku: "QK-TS-01", image: "https://via.placeholder.com/100" },
      { name: "Qikink Hoodie", price: 899, sku: "QK-HD-02", image: "https://via.placeholder.com/100" }
    ];

    for (const item of items) {
      await addDoc(collection(db, "products"), {
        ...item,
        margin: 150,
        finalPrice: item.price + 150,
        createdAt: serverTimestamp()
      });
    }
    loadData();
    alert("Sync Complete!");
  };

  // 3. Delete Function
  const handleDelete = async (id: string) => {
    if (confirm("Delete kar dein?")) {
      await deleteDoc(doc(db, "products", id));
      loadData();
    }
  };

  // 4. Update Margin
  const handleUpdate = async (id: string, newMargin: number, base: number) => {
    await updateDoc(doc(db, "products", id), {
      margin: newMargin,
      finalPrice: base + newMargin
    });
    setEditId(null);
    loadData();
  };

  return (
    <div style={{ padding: '20px', background: '#f4f4f4', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', background: '#fff', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0 }}>📦 Qikink Inventory</h1>
        <button onClick={syncFromQikink} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>
          {loading ? "Syncing..." : "Sync Products"}
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '10px', overflow: 'hidden' }}>
        <thead style={{ background: '#eee' }}>
          <tr>
            <th style={{ padding: '15px', textAlign: 'left' }}>Product</th>
            <th style={{ padding: '15px', textAlign: 'left' }}>Base</th>
            <th style={{ padding: '15px', textAlign: 'left' }}>Margin</th>
            <th style={{ padding: '15px', textAlign: 'left' }}>Final Price</th>
            <th style={{ padding: '15px', textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '15px' }}>{p.name}</td>
              <td style={{ padding: '15px' }}>₹{p.price || p.basePrice}</td>
              <td style={{ padding: '15px' }}>
                {editId === p.id ? (
                  <input 
                    type="number" 
                    defaultValue={p.margin} 
                    onBlur={(e) => handleUpdate(p.id, Number(e.target.value), p.price || p.basePrice)}
                    style={{ width: '60px', padding: '5px' }}
                  />
                ) : (
                  <span onClick={() => setEditId(p.id)} style={{ color: '#6366f1', cursor: 'pointer', fontWeight: 'bold' }}>
                    ₹{p.margin} ✏️
                  </span>
                )}
              </td>
              <td style={{ padding: '15px', fontWeight: 'bold' }}>₹{p.finalPrice}</td>
              <td style={{ padding: '15px', textAlign: 'right' }}>
                <button onClick={() => handleDelete(p.id)} style={{ background: 'red', color: '#white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
