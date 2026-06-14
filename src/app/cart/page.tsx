"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2, Zap } from "lucide-react";
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

  useEffect(() => {
    let unsubscribeSnapshot: () => void = () => {};

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      unsubscribeSnapshot(); 
      
      if (!user) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      // User-wise Cart Path Fixed: users/{uid}/cart
      const cartRef = collection(db, "users", user.uid, "cart");

      unsubscribeSnapshot = onSnapshot(cartRef, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<CartItem, "id">),
        }));
        setCartItems(data);
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSnapshot();
    };
  }, []);

  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const priceToUse = item.discountPrice || item.price;
      return total + priceToUse * item.quantity;
    }, 0);
  }, [cartItems]);

  async function updateQuantity(id: string, quantity: number) {
    if (quantity < 1 || !auth.currentUser) return;
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid, "cart", id), { quantity });
    } catch (error) { console.error(error); }
  }

  async function removeItem(id: string) {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "cart", id));
    } catch (error) { console.error(error); }
  }

  return (
    <main className="min-h-screen bg-[#f6f6f6] pb-[120px]">
      <div className="sticky top-0 z-50 bg-[#f6f6f6]/90 px-3 pt-3 backdrop-blur-md">
        <div className="flex items-center justify-between rounded-[18px] bg-white px-3 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-[18px] font-black">My Cart</h1>
              <p className="text-[11px] text-gray-500">{cartItems.length} items</p>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <ShoppingBag size={18} className="text-purple-600" />
          </div>
        </div>
      </div>

      <section className="space-y-4 px-3 pt-4">
        {loading ? (
          <div className="py-20 text-center text-sm font-bold">Loading Cart...</div>
        ) : cartItems.length === 0 ? (
          <div className="py-24 text-center">
            <h2 className="text-[22px] font-black">Cart is Empty</h2>
            <p className="mt-2 text-sm text-gray-500">Add products to continue</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="rounded-[22px] bg-white p-3 shadow-sm">
              <div className="flex gap-3">
                <div className="h-[110px] w-[110px] overflow-hidden rounded-[18px] bg-gray-100">
                  <img src={item.image} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <h2 className="line-clamp-2 text-[15px] font-black">{item.title}</h2>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-lg bg-gray-100 px-2 py-1 text-[10px] font-bold">Size: {item.size}</span>
                    <div style={{ background: item.color }} className="h-5 w-5 rounded-full border" />
                  </div>
                  <h3 className="mt-3 text-[22px] font-black">
                    ₹{item.discountPrice || item.price}
                  </h3>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100"><Minus size={14} /></button>
                      <span className="min-w-[20px] text-center text-sm font-black">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white"><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-white px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[11px] font-bold text-gray-500">Total Amount</p>
              <h2 className="text-[24px] font-black">₹{totalPrice}</h2>
            </div>
            <button
              onClick={() => router.push("/checkout?cart=true")}
              className="flex flex-1 items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-violet-600 to-fuchsia-500 py-4 text-[14px] font-black text-white"
            >
              <Zap size={16} />
              Checkout
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
