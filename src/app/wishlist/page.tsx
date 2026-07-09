"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

import { auth, db } from "@/firebase/config";

import {
  Heart,
  Loader2,
  ShoppingCart,
  Trash2,
} from "lucide-react";

interface WishlistItem {
  id: string;
  productId: string;
  productTitle: string;
  image: string;
  price: number;
  mrp?: number;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeWishlist: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      const wishlistRef = collection(db, "wishlist");

      const q = query(
        wishlistRef,
        where("userId", "==", user.uid)
      );

      unsubscribeWishlist = onSnapshot(
        q,
        (snapshot) => {
          const data: WishlistItem[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<WishlistItem, "id">),
          }));

          setItems(data);
          setLoading(false);
        },
        (error) => {
          console.error("WISHLIST_ERROR:", error);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeWishlist) unsubscribeWishlist();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2
          size={40}
          className="animate-spin text-violet-600"
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-800">
          My Wishlist
        </h1>

        <p className="text-slate-500 mt-1">
          Total Items: {items.length}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-[var(--card-color)] rounded-3xl p-8 text-center shadow-sm">
          <Heart
            size={60}
            className="mx-auto text-slate-300"
          />

          <h3 className="mt-4 text-xl font-bold text-slate-700">
            Wishlist Empty
          </h3>

          <p className="text-slate-500 mt-2">
            Save products you love here.
          </p>

          <Link
            href="/"
            className="inline-block mt-5 bg-violet-600 text-[var(--button-text-color)] px-6 py-3 rounded-xl font-bold"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-[var(--card-color)] rounded-3xl p-4 shadow-sm border border-slate-100"
            >
              <div className="flex gap-4">
                <img
                  src={item.image}
                  alt={item.productTitle}
                  className="w-24 h-24 rounded-2xl object-cover bg-slate-100"
                />

                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 line-clamp-2">
                    {item.productTitle}
                  </h3>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xl font-black text-violet-700">
                      ₹{item.price}
                    </span>

                    {item.mrp && (
                      <span className="text-sm text-slate-400 line-through">
                        ₹{item.mrp}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/product/${item.productId}`}
                  className="flex-1 bg-violet-600 text-[var(--button-text-color)] py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={16} />
                  View Product
                </Link>

                <button className="h-12 w-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
