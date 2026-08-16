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
    'pending': 'text-[var(--color-warning)] bg-[var(--color-warning)] border-[var(--color-warning)]', 
    'placed': 'text-[var(--color-primary-button)] bg-[var(--color-primary-button)] theme-primary-border',
    'shipped': 'text-[var(--color-primary-button)] bg-[var(--color-primary-button)] border-[var(--color-primary-button)]', 
    'delivered': 'text-[var(--color-success)] bg-[var(--color-success)] border-[var(--color-success)]',
    'cancelled': 'text-[var(--color-danger)] bg-[var(--color-danger)] border-[var(--color-danger)]'
  }[s?.toLowerCase()] || 'text-[var(--text-secondary)] bg-[var(--color-page-background)] border-[var(--color-border)]');

  return (
    <main className="min-h-screen bg-[var(--color-primary-button)] pb-24">
      {toast && <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] bg-[var(--color-card-background)] text-[var(--button-text-color)] px-6 py-3 rounded-full flex items-center gap-2 text-xs font-bold shadow-xl"><Check size={14}/> {toast}</div>}

      <div className="bg-gradient-to-br from-[var(--color-primary-button)] to-[var(--color-primary-button)] text-[var(--button-text-color)] p-6 pb-28 rounded-b-[2.5rem] shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black">My Orders</h1>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="bg-[var(--color-card-background)]/20 rounded-full px-4 py-2 text-xs outline-none placeholder:text-[var(--button-text-color)]/60 w-32" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[ {l: "Total Orders", v: stats.total}, {l: "Total Spent", v: `₹${stats.spent}`}, {l: "Delivered", v: stats.delivered}, {l: "Pending", v: stats.pending} ].map((s, i) => (
             <div key={i} className="bg-[var(--color-card-background)]/10 p-3 rounded-2xl border border-[var(--color-border)]/10"><p className="text-[9px] opacity-70">{s.l}</p><p className="font-black text-sm">{s.v}</p></div>
          ))}
        </div>
      </div>

      <div className="px-4 -mt-12 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar bg-[var(--color-card-background)] p-1.5 rounded-2xl shadow-sm border border-[var(--color-border)]">
          {['All Orders', 'Pending', 'Placed', 'Shipped', 'Delivered', 'Cancelled'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all ${activeTab === tab ? 'bg-[var(--color-primary-button)] text-[var(--button-text-color)] shadow-lg' : 'bg-transparent text-[var(--text-secondary)]'}`}>
              {tab} ({tab === 'All Orders' ? orders.length : orders.filter(o => o.status?.toLowerCase() === tab.toLowerCase()).length})
            </button>
          ))}
        </div>
      </div>

      <section className="px-4 space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-card-background)] rounded-3xl shadow-sm"><Box size={50} className="mx-auto text-[var(--text-primary)]"/><p className="font-black mt-4">No Orders Found</p></div>
        ) : filteredOrders.map(order => (
          <div key={order.id} className="bg-[var(--color-card-background)] p-5 rounded-3xl shadow-sm border border-[var(--color-border)]">
            <div className="flex gap-4">
              <img 
                src={order.productImage && order.productImage.length > 5 ? order.productImage : "/placeholder.png"} 
                className="w-20 h-20 rounded-2xl object-cover bg-[var(--color-page-background)]" 
                alt={order.productTitle || "Product"}
              />
              <div className="flex-1">
                <h3 className="font-bold text-[var(--text-primary)] line-clamp-1">{order.productTitle || "Product"}</h3>
                <div className="flex items-center gap-2 mt-1 cursor-pointer" onClick={() => { navigator.clipboard.writeText(order.orderNumber || order.id); showToast("Copied!"); }}>
                    <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase">ID: {order.orderNumber?.slice(-10) || order.id.slice(0, 10)}</p>
                    <Copy size={10} className="text-[var(--color-primary-button)]" />
                </div>
                <p className="text-xl font-black text-[var(--color-primary-button)] mt-1">₹{order.finalAmount || 0}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="bg-[var(--color-page-background)] px-2 py-0.5 rounded-lg text-[9px] font-bold text-[var(--text-secondary)]">Qty: {order.quantity || 1}</span>
                    <p className="text-[9px] text-[var(--text-secondary)] font-bold">{order?.placedAt?.seconds ? new Date(order.placedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--color-border)]">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(order.status)}`}>{order.status || "Placed"}</span>
              <Link href={`/orders/${order.id}`} className="text-xs font-black text-[var(--color-primary-button)] underline">View Details →</Link>
            </div>
          </div>
        ))}
      </section>

      <div className="fixed bottom-0 w-full bg-[var(--color-card-background)] border-t border-[var(--color-border)] px-6 py-4 flex justify-between items-center z-50">
        {[ {icon: Home, l: "Home", p: "/"}, {icon: LayoutGrid, l: "Categories", p: "/categories"}, {icon: ShoppingBag, l: "Cart", p: "/cart"}, {icon: ListOrdered, l: "Orders", p: "/orders"}, {icon: User, l: "Profile", p: "/profile"} ].map((n, i) => (
          <Link href={n.p} key={i} className="flex flex-col items-center gap-1">
            <n.icon size={20} className={pathname === n.p ? "text-[var(--color-primary-button)]" : "text-[var(--text-secondary)]"} />
            <span className={`text-[9px] font-bold ${pathname === n.p ? "text-[var(--color-primary-button)]" : "text-[var(--text-secondary)]"}`}>{n.l}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
