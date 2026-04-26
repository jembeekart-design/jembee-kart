'use client';

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; 
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function QikinkManager() {
  const [url, setUrl] = useState("https://dashboard.qikink.com/products/list");
  const [loading, setLoading] = useState(false);
  const [importedProducts, setImportedProducts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // 1. Fetch products from Firestore (Jo humne pehle save kiye hain)
  const loadStoredProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    const products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setImportedProducts(products);
  };

  useEffect(() => { loadStoredProducts(); }, []);

  // 2. Qikink List se Bulk Import (Simulation)
  const handleBulkImport = async () => {
    setLoading(true);
    // Note: Actual implementation mein Qikink API se data map hoga
    const mockBulkData = [
      { name: "T-Shirt 01", price: 350, sku: "QK-TS-01", image: "https://via.placeholder.com/150" },
      { name: "Hoodie 02", price: 750, sku: "QK-HD-02", image: "https://via.placeholder.com/150" }
    ];

    for (const item of mockBulkData) {
      await addDoc(collection(db, "products"), {
        ...item,
        margin: 150,
        finalPrice: item.price + 150,
        createdAt: serverTimestamp()
      });
    }
    await loadStoredProducts();
    setLoading(false);
    alert("✅ List Imported & Saved to Firebase!");
  };

  // 3. Delete Function
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteDoc(doc(db, "products", id));
      loadStoredProducts();
    }
  };

  // 4. Edit Margin Function
  const handleUpdateMargin = async (id: string, newMargin: number, basePrice: number) => {
    const productRef = doc(db, "products", id);
    await updateDoc(productRef, {
      margin: newMargin,
      finalPrice: basePrice + newMargin
    });
    setEditingId(null);
    loadStoredProducts();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-white">📦 Qikink Inventory</h1>
        <button 
          onClick={handleBulkImport}
          className="btn-guardian px-6 py-3 text-xs uppercase font-bold"
        >
          {loading ? "Syncing..." : "🔄 Sync List from Qikink"}
        </button>
      </div>

      {/* Product Table with Edit/Delete */}
      <div className="glass-guardian overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-[10px] uppercase tracking-widest font-black text-white/50">
              <th className="p-5">Product</th>
              <th className="p-5">Base Price</th>
              <th className="p-5">Margin</th>
              <th className="p-5">Final Price</th>
              <th className="p-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {importedProducts.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-5 flex items-center gap-4">
                  <img src={p.image} className="w-10 h-10 rounded-lg" alt="" />
                  <span className="font-bold text-sm">{p.name}</span>
                </td>
                <td className="p-5 text-sm">₹{p.price || p.basePrice}</td>
                <td className="p-5">
                  {editingId === p.id ? (
                    <input 
                      type="number"
                      defaultValue={p.margin}
                      onBlur={(e) => handleUpdateMargin(p.id, Number(e.target.value), p.price || p.basePrice)}
                      className="w-20 bg-black/50 border border-[var(--primary)] rounded px-2 py-1 text-white"
                      autoFocus
                    />
                  ) : (
                    <span onClick={() => setEditingId(p.id)} className="cursor-pointer text-[var(--primary)] font-bold">
                      ₹{p.margin} ✏️
                    </span>
                  )}
                </td>
                <td className="p-5 font-black text-lg text-white">₹{p.finalPrice}</td>
                <td className="p-5 text-right space-x-2">
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="text-[10px] font-bold text-red-400 hover:text-red-200 uppercase"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
