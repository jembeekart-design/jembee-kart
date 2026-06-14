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

  return (
    <main className="min-h-screen bg-[#f8f9fe] pb-32">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-[#f8f9fe]/90 backdrop-blur-md px-4 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 bg-white rounded-full shadow-sm border border-gray-100">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-black text-gray-900">My Cart</h1>
            <p className="text-xs text-gray-500 font-medium">{cartItems.length} Items</p>
          </div>
        </div>
      </div>

      <section className="px-4 space-y-4">
        {loading ? (
          <div className="text-center py-20 font-bold">Loading...</div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20 font-bold text-gray-500">Your cart is empty</div>
        ) : (
          <>
            {/* PROGRESS BAR SECTION */}
            {remaining > 0 ? (
              <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm">
                <div className="flex justify-between text-[11px] font-bold mb-2">
                  <span className="text-indigo-600 flex items-center gap-1">🎁 Add ₹{remaining} more to get a FREE GIFT</span>
                  <span>₹{totalPrice} / ₹{FREE_GIFT_THRESHOLD}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              <div className="text-center text-xs font-bold text-green-600 bg-green-50 p-3 rounded-2xl border border-green-100">
                🎉 You've unlocked a FREE GIFT!
              </div>
            )}

            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex gap-4">
                <img src={item.image} className="w-24 h-24 rounded-2xl object-cover bg-gray-100" />
                <div className="flex-1">
                  <h2 className="font-bold text-sm text-gray-900 line-clamp-1">{item.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded-md text-gray-600">Size: {item.size}</span>
                    <div style={{ background: item.color }} className="w-4 h-4 rounded-full border border-gray-200" />
                  </div>
                  <p className="font-black text-lg mt-2 text-indigo-600">₹{item.discountPrice || item.price}</p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1">
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

      {/* FEATURES GRID */}
      {cartItems.length > 0 && (
        <div className="grid grid-cols-2 gap-3 px-4 mt-6">
          {[ {icon: Truck, label: "Free Delivery"}, {icon: ShieldCheck, label: "100% Secure"}, {icon: RotateCcw, label: "Easy Returns"}, {icon: CreditCard, label: "COD Available"} ].map((f, i) => (
            <div key={i} className="bg-white p-3 rounded-2xl flex items-center gap-2 border border-gray-100">
              <f.icon size={16} className="text-indigo-500" />
              <span className="text-[10px] font-bold text-gray-600">{f.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* CHECKOUT BAR */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 rounded-t-[2rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <div className="flex justify-between items-center mb-4 px-2">
            <span className="text-gray-500 font-medium text-sm">Total Amount</span>
            <span className="text-2xl font-black text-indigo-900">₹{totalPrice}</span>
          </div>
          <button 
            onClick={() => router.push("/checkout?cart=true")}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
          >
            <Zap size={18} /> Secure Checkout
          </button>
        </div>
      )}
    </main>
  );
}
