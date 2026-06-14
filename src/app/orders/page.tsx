"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { Copy, ShieldCheck, Truck, RotateCcw, Headphones, Home, LayoutGrid, ShoppingBag, ListOrdered, User, Box, Check } from "lucide-react";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("All Orders");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      const q = query(collection(db, "orders"), where("userId", "==", user.uid));
      return onSnapshot(q, (snapshot) => {
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    });
    return () => unsubscribeAuth();
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2000); };
  
  const stats = {
    total: orders.length,
    delivered: orders.filter(o => o.status?.toLowerCase() === 'delivered').length,
    pending: orders.filter(o => ['pending', 'placed'].includes(o.status?.toLowerCase())).length,
    spent: orders.reduce((acc, curr) => acc + Number(curr.finalAmount || 0), 0)
  };

  const filteredOrders = orders.filter(o => {
    const matchesTab = activeTab === "All Orders" || o.status?.toLowerCase() === activeTab.toLowerCase();
    const title = o.productTitle || "";
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || o.id?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusColor = (s: string) => ({
    'pending': 'text-orange-500 bg-orange-50 border-orange-100', 
    'placed': 'text-blue-500 bg-blue-50 border-blue-100',
    'shipped': 'text-purple-500 bg-purple-50 border-purple-100', 
    'delivered': 'text-green-500 bg-green-50 border-green-100',
    'cancelled': 'text-red-500 bg-red-50 border-red-100'
  }[s?.toLowerCase()] || 'text-gray-500 bg-gray-50 border-gray-100');

  return (
    <main className="min-h-screen bg-[#f8f9fe] pb-24">
      {toast && <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] bg-black text-white px-6 py-3 rounded-full flex items-center gap-2 text-xs font-bold shadow-xl"><Check size={14}/> {toast}</div>}

      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 pb-28 rounded-b-[2.5rem] shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black">My Orders</h1>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="bg-white/20 rounded-full px-4 py-2 text-xs outline-none placeholder:text-white/60 w-32" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[ {l: "Total Orders", v: stats.total}, {l: "Total Spent", v: `₹${stats.spent}`}, {l: "Delivered", v: stats.delivered}, {l: "Pending", v: stats.pending} ].map((s, i) => (
             <div key={i} className="bg-white/10 p-3 rounded-2xl border border-white/10"><p className="text-[9px] opacity-70">{s.l}</p><p className="font-black text-sm">{s.v}</p></div>
          ))}
        </div>
      </div>

      <div className="px-4 -mt-12 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
          {['All Orders', 'Pending', 'Placed', 'Shipped', 'Delivered', 'Cancelled'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'bg-transparent text-gray-500'}`}>
              {tab} ({tab === 'All Orders' ? orders.length : orders.filter(o => o.status?.toLowerCase() === tab.toLowerCase()).length})
            </button>
          ))}
        </div>
      </div>

      <section className="px-4 space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm"><Box size={50} className="mx-auto text-gray-300"/><p className="font-black mt-4">No Orders Found</p></div>
        ) : filteredOrders.map(order => (
          <div key={order.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex gap-4">
              <img 
                src={order.productImage && order.productImage.length > 5 ? order.productImage : "/placeholder.png"} 
                className="w-20 h-20 rounded-2xl object-cover bg-gray-50" 
                alt={order.productTitle || "Product"}
              />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 line-clamp-1">{order.productTitle || "Product"}</h3>
                <div className="flex items-center gap-2 mt-1 cursor-pointer" onClick={() => { navigator.clipboard.writeText(order.orderNumber || order.id); showToast("Copied!"); }}>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">ID: {order.orderNumber?.slice(-10) || order.id.slice(0, 10)}</p>
                    <Copy size={10} className="text-indigo-400" />
                </div>
                <p className="text-xl font-black text-indigo-600 mt-1">₹{order.finalAmount || 0}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="bg-gray-100 px-2 py-0.5 rounded-lg text-[9px] font-bold text-gray-600">Qty: {order.quantity || 1}</span>
                    <p className="text-[9px] text-gray-400 font-bold">{order?.placedAt?.seconds ? new Date(order.placedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(order.status)}`}>{order.status || "Placed"}</span>
              <Link href={`/orders/${order.id}`} className="text-xs font-black text-indigo-600 underline">View Details →</Link>
            </div>
          </div>
        ))}
      </section>

      <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50">
        {[ {icon: Home, l: "Home", p: "/"}, {icon: LayoutGrid, l: "Categories", p: "/categories"}, {icon: ShoppingBag, l: "Cart", p: "/cart"}, {icon: ListOrdered, l: "Orders", p: "/orders"}, {icon: User, l: "Profile", p: "/profile"} ].map((n, i) => (
          <Link href={n.p} key={i} className="flex flex-col items-center gap-1">
            <n.icon size={20} className={pathname === n.p ? "text-indigo-600" : "text-gray-400"} />
            <span className={`text-[9px] font-bold ${pathname === n.p ? "text-indigo-600" : "text-gray-400"}`}>{n.l}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
