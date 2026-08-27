import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { onAuthStateChanged } from "firebase/auth";

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);

  useEffect(() => {
    let unsubscribeWishlist: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Cleanup previous subscription if user changes/logs out
      if (unsubscribeWishlist) unsubscribeWishlist();
      
      if (!user) {
        setWishlistItems([]);
        return;
      }

      // Consistent with WishlistPage implementation
      const wishlistRef = collection(db, "wishlist");
      const q = query(wishlistRef, where("userId", "==", user.uid));
      
      unsubscribeWishlist = onSnapshot(q, (snapshot) => {
        setWishlistItems(snapshot.docs.map((d) => d.data().productId));
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeWishlist) unsubscribeWishlist();
    };
  }, []);

  const toggleWishlist = async (product: any) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please login to use wishlist");
      return;
    }

    const productId = product.id;
    const isLiked = wishlistItems.includes(productId);

    if (isLiked) {
      // Prevent duplicates in query
      const q = query(
        collection(db, "wishlist"),
        where("userId", "==", user.uid),
        where("productId", "==", productId)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (d) => await deleteDoc(doc(db, "wishlist", d.id)));
      
      // Optimistic update
      setWishlistItems(wishlistItems.filter((id) => id !== productId));
    } else {
      // Fields match existing WishlistPage expectations
      await addDoc(collection(db, "wishlist"), {
        userId: user.uid,
        productId,
        productTitle: product.title || "Unknown Product",
        image: product.images?.[0] || product.image || "/placeholder.png",
        price: product.price || product.discountPrice || 0,
      });
      
      // Optimistic update
      setWishlistItems([...wishlistItems, productId]);
    }
  };

  return { wishlistItems, toggleWishlist };
}
