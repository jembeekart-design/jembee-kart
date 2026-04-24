// src/services/qikinkService.ts

import {
  fetchQikinkProduct,
  fetchQikinkOrders,
  createQikinkOrder,
} from "@/lib/qikink";

import { addProduct } from "./productService";
import { createOrder, updateOrderStatus } from "./orderService";

// 🔗 Extract product ID from URL
const extractProductId = (url: string) => {
  try {
    const parts = url.split("/");
    return parts[parts.length - 1];
  } catch {
    throw new Error("Invalid Qikink URL");
  }
};

// 📦 Import product from Qikink → Firestore
export const importQikinkProduct = async (
  url: string,
  margin: number
) => {
  try {
    const productId = extractProductId(url);

    const data = await fetchQikinkProduct(productId);

    const product = {
      name: data.name,
      price: data.price,
      margin,
      finalPrice: data.price + margin,
      image: data.image,
      visible: true,
      qikinkId: productId,
    };

    const id = await addProduct(product);

    return id;
  } catch (error) {
    console.error("Import product error:", error);
    throw error;
  }
};

// 🔄 Sync Qikink orders → Firestore
export const syncQikinkOrders = async () => {
  try {
    const orders = await fetchQikinkOrders();

    for (const order of orders) {
      await createOrder({
        customer: order.customer_name,
        phone: order.phone,
        address: order.address,
        status: order.status || "Pending",
        items: order.items,
        qikinkId: order.id,
      });
    }

    return true;
  } catch (error) {
    console.error("Sync orders error:", error);
    throw error;
  }
};

// 🚀 Send order to Qikink (important 🔥)
export const placeQikinkOrder = async (orderData: any) => {
  try {
    const response = await createQikinkOrder(orderData);

    return response;
  } catch (error) {
    console.error("Place order error:", error);
    throw error;
  }
};

// 🔄 Update local order status from Qikink
export const updateOrderFromQikink = async (
  localId: string,
  status: string
) => {
  try {
    await updateOrderStatus(localId, status);
  } catch (error) {
    console.error("Update order status error:", error);
    throw error;
  }
};
