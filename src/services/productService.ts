// src/services/productService.ts

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// 📦 Collection reference
const productsRef = collection(db, "products");

// ➕ Add product (Qikink import)
export const addProduct = async (product: any) => {
  try {
    const docRef = await addDoc(productsRef, {
      ...product,
      createdAt: new Date(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Add product error:", error);
    throw error;
  }
};

// 📄 Get all products
export const getProducts = async () => {
  try {
    const snapshot = await getDocs(productsRef);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Get products error:", error);
    throw error;
  }
};

// 🔍 Get single product
export const getProductById = async (id: string) => {
  try {
    const docRef = doc(db, "products", id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      throw new Error("Product not found");
    }

    return {
      id: snap.id,
      ...snap.data(),
    };
  } catch (error) {
    console.error("Get product error:", error);
    throw error;
  }
};

// ✏️ Update product (margin / visibility)
export const updateProduct = async (
  id: string,
  data: any
) => {
  try {
    const docRef = doc(db, "products", id);

    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Update product error:", error);
    throw error;
  }
};

// ❌ Delete product
export const deleteProduct = async (id: string) => {
  try {
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Delete product error:", error);
    throw error;
  }
};
