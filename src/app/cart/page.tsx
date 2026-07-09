"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2, Zap, ShieldCheck, Truck, RotateCcw, CreditCard } from "lucide-react";
import { db, auth } from "@/firebase/config";

interface CartItem {
  id: string;
  productId: string;
  title: string;
  image: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  size?: string;
  color?: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const FREE_GIFT_THRESHOLD = 3500;

  useEffect(() => {
    let unsubscribeSnapshot: () => void = () => {};
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      unsubscribeSnapshot();
      if (!user) { setCartItems([]); setLoading(false); return; }
      const cartRef = collection(db, "users", user.uid, "cart");
      unsubscribeSnapshot = onSnapshot(cartRef, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<CartItem, "id">) }));
        setCartItems(data);
        setLoading(false);
      });
    });
    return () => { unsubscribeAuth(); unsubscribeSnapshot(); };
  }, []);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.discountPrice || item.price) * item.quantity, 0);
  }, [cartItems]);

  const progress = Math.min((totalPrice / FREE_GIFT_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_GIFT_THRESHOLD - totalPrice, 0);

  // FINAL FIX: Checkout navigation logic
  const handleCheckout = () => {
    const item = cartItems[0];
    if (item) {
      // Agar productId exist karta hai toh wo use karo, warna doc ID (item.id) use karo
      const pid = item.productId || item.id;
      router.push(`/checkout?productId=${pid}`);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f9fe] pb-24">
      {/* HEADER */}
      <div className="p-4 flex items-center gap-4 sticky top-0 bg-[#f8f9fe]/80 backdrop-blur-md z-10">
        <button onClick={() => router.back()} className="p-2 bg-[var(--card-color)] rounded-full shadow-sm border border-[var(--border-color)]">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-black text-lg">My Cart ({cartItems.length} Items)</h1>
      </div>

      <section className="px-4 space-y-4">
        {loading ? (
          <div className="text-center py-20 font-bold">Loading...</div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20 font-bold text-[var(--muted-text-color)]">Your cart is empty</div>
        ) : (
          <>
            {/* PROGRESS BAR */}
            {remaining > 0 ? (
              <div className="bg-[var(--card-color)] p-4 rounded-2xl border border-indigo-100 shadow-sm">
                <div className="flex justify-between text-[11px] font-bold mb-2">
                  <span className="text-indigo-600 flex items-center gap-1">🎁 Add ₹{remaining} more for FREE GIFT</span>
                  <span>₹{totalPrice} / ₹{FREE_GIFT_THRESHOLD}</span>
                </div>
                <div className="w-full h-2 bg-[var(--background-color)] rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              <div className="text-center text-xs font-bold text-[var(--success-color)] bg-green-50 p-3 rounded-2xl border border-green-100"> 🎉 You've unlocked a FREE GIFT! </div>
            )}

            {/* ITEMS LIST */}
            {cartItems.map((item) => (
              <div key={item.id} className="bg-[var(--card-color)] p-4 rounded-3xl shadow-sm border border-[var(--border-color)] flex gap-4">
                <img src={item.image} className="w-24 h-24 rounded-2xl object-cover bg-[var(--background-color)]" />
                <div className="flex-1">
                  <h2 className="font-bold text-sm text-[var(--text-color)] line-clamp-1">{item.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold bg-[var(--background-color)] px-2 py-0.5 rounded-md text-[var(--muted-text-color)]">Size: {item.size}</span>
                    <div style={{ background: item.color }} className="w-4 h-4 rounded-full border border-[var(--border-color)]" />
                  </div>
                  <p className="font-black text-lg mt-2 text-indigo-600">₹{item.discountPrice || item.price}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-3 bg-[var(--background-color)] rounded-full px-2 py-1">
                      <button onClick={() => updateDoc(doc(db, "users", auth.currentUser!.uid, "cart", item.id), { quantity: Math.max(1, item.quantity - 1) })} className="p-1"><Minus size={12}/></button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateDoc(doc(db, "users", auth.currentUser!.uid, "cart", item.id), { quantity: item.quantity + 1 })} className="p-1"><Plus size={12}/></button>
                    </div>
                    <button onClick={() => deleteDoc(doc(db, "users", auth.currentUser!.uid, "cart", item.id))} className="text-red-400 p-2"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </section>

      {/* CHECKOUT BAR */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--card-color)] border-t border-[var(--border-color)] rounded-t-[2rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <div className="flex justify-between items-center mb-4 px-2">
            <span className="text-[var(--muted-text-color)] font-medium text-sm">Total Amount</span>
            <span className="text-2xl font-black text-indigo-900">₹{totalPrice}</span>
          </div>
          <button 
            onClick={handleCheckout} 
            className="w-full bg-indigo-600 text-[var(--button-text-color)] py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
          >
            <Zap size={18} /> Secure Checkout
          </button>
        </div>
      )}
    </main>
  );
}
