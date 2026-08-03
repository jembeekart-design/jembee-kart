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
    <main className="min-h-screen bg-[var(--color-page-background)] pb-24">
      {/* HEADER */}
      <div className="p-4 flex items-center gap-4 sticky top-0 bg-[var(--color-primary-button)]/80 backdrop-blur-md z-10">
        <button onClick={() => router.back()} className="p-2 bg-[var(--color-card-background)] rounded-full shadow-sm border border-[var(--color-border)]">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-black text-lg">My Cart ({cartItems.length} Items)</h1>
      </div>

      <section className="px-4 space-y-4">
        {loading ? (
          <div className="text-center py-20 font-bold">Loading...</div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20 font-bold text-[var(--text-secondary)]">Your cart is empty</div>
        ) : (
          <>
            {/* PROGRESS BAR */}
            {remaining > 0 ? (
              <div className="bg-[var(--color-card-background)] p-4 rounded-2xl border border-[var(--color-primary-button)] shadow-sm">
                <div className="flex justify-between text-[11px] font-bold mb-2">
                  <span className="text-[var(--color-primary-button)] flex items-center gap-1">🎁 Add ₹{remaining} more for FREE GIFT</span>
                  <span>₹{totalPrice} / ₹{FREE_GIFT_THRESHOLD}</span>
                </div>
                <div className="w-full h-2 bg-[var(--color-page-background)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-primary-button)] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              <div className="text-center text-xs font-bold text-[var(--color-success)] bg-[var(--color-success)] p-3 rounded-2xl border border-[var(--color-success)]"> 🎉 You've unlocked a FREE GIFT! </div>
            )}

            {/* ITEMS LIST */}
            {cartItems.map((item) => (
              <div key={item.id} className="bg-[var(--color-card-background)] p-4 rounded-3xl shadow-sm border border-[var(--color-border)] flex gap-4">
                <img src={item.image} className="w-24 h-24 rounded-2xl object-cover bg-[var(--color-page-background)]" />
                <div className="flex-1">
                  <h2 className="font-bold text-sm text-[var(--text-primary)] line-clamp-1">{item.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold bg-[var(--color-page-background)] px-2 py-0.5 rounded-md text-[var(--text-secondary)]">Size: {item.size}</span>
                    <div style={{ background: item.color }} className="w-4 h-4 rounded-full border border-[var(--color-border)]" />
                  </div>
                  <p className="font-black text-lg mt-2 text-[var(--color-primary-button)]">₹{item.discountPrice || item.price}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-3 bg-[var(--color-page-background)] rounded-full px-2 py-1">
                      <button onClick={() => updateDoc(doc(db, "users", auth.currentUser!.uid, "cart", item.id), { quantity: Math.max(1, item.quantity - 1) })} className="p-1"><Minus size={12}/></button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateDoc(doc(db, "users", auth.currentUser!.uid, "cart", item.id), { quantity: item.quantity + 1 })} className="p-1"><Plus size={12}/></button>
                    </div>
                    <button onClick={() => deleteDoc(doc(db, "users", auth.currentUser!.uid, "cart", item.id))} className="text-[var(--color-danger)] p-2"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </section>

      {/* CHECKOUT BAR */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--color-card-background)] border-t border-[var(--color-border)] rounded-t-[2rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <div className="flex justify-between items-center mb-4 px-2">
            <span className="text-[var(--text-secondary)] font-medium text-sm">Total Amount</span>
            <span className="text-2xl font-black text-[var(--color-primary-button)]">₹{totalPrice}</span>
          </div>
          <button 
            onClick={handleCheckout} 
            className="w-full bg-[var(--color-primary-button)] text-[var(--button-text-color)] py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[var(--color-primary-button)] transition"
          >
            <Zap size={18} /> Secure Checkout
          </button>
        </div>
      )}
    </main>
  );
}
