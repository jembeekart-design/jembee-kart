// src/services/orderService.ts

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

// 📦 Collection
const ordersRef = collection(db, "orders");

// ➕ Create order
export const createOrder = async (order: any) => {
  try {
    const docRef = await addDoc(ordersRef, {
      ...order,
      status: "Pending",
      createdAt: new Date(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Create order error:", error);
    throw error;
  }
};

// 📄 Get all orders
export const getOrders = async () => {
  try {
    const snapshot = await getDocs(ordersRef);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Get orders error:", error);
    throw error;
  }
};

// 🔍 Get order by ID
export const getOrderById = async (id: string) => {
  try {
    const docRef = doc(db, "orders", id);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      throw new Error("Order not found");
    }

    return {
      id: snap.id,
      ...snap.data(),
    };
  } catch (error) {
    console.error("Get order error:", error);
    throw error;
  }
};

// ✏️ Update order status
export const updateOrderStatus = async (
  id: string,
  status: string
) => {
  try {
    const docRef = doc(db, "orders", id);

    await updateDoc(docRef, {
      status,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Update order error:", error);
    throw error;
  }
};

// ❌ Delete order
export const deleteOrder = async (id: string) => {
  try {
    const docRef = doc(db, "orders", id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Delete order error:", error);
    throw error;
  }
};
