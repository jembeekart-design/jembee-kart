"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, auth } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Firestore se current user ke orders fetch karein
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(fetchedOrders);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading Orders...</div>;

  return (
    <main className="p-4 bg-[#f6f6f6] min-h-screen">
      <h1 className="text-2xl font-black mb-4">My Orders</h1>
      {orders.length === 0 ? <p>No orders found.</p> : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm">
              <h3 className="font-black text-lg">{order.productTitle}</h3>
              <p className="text-sm text-gray-500">Amount: ₹{order.amount}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {order.status}
                </span>
                {/* Yahan Tracking Link add karein */}
                <button className="text-violet-700 text-xs font-bold underline">Track Order</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
