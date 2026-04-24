// src/lib/qikink.ts

const BASE_URL = "https://api.qikink.com/api";

// 🔐 Get credentials (safe)
const getHeaders = () => {
  const apiKey = process.env.QIKINK_API_KEY;

  if (!apiKey) {
    throw new Error("Qikink API key missing");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
};

// 📦 Fetch product by ID / URL
export const fetchQikinkProduct = async (productId: string) => {
  try {
    const res = await fetch(
      `${BASE_URL}/products/${productId}`,
      {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch product");
    }

    return await res.json();
  } catch (error) {
    console.error("Qikink product error:", error);
    throw error;
  }
};

// 📦 Fetch all products
export const fetchAllQikinkProducts = async () => {
  try {
    const res = await fetch(`${BASE_URL}/products`, {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }

    return await res.json();
  } catch (error) {
    console.error("Qikink list error:", error);
    throw error;
  }
};

// 📦 Fetch orders
export const fetchQikinkOrders = async () => {
  try {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: "GET",
      headers: getHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch orders");
    }

    return await res.json();
  } catch (error) {
    console.error("Qikink orders error:", error);
    throw error;
  }
};

// 📦 Create order (important 🔥)
export const createQikinkOrder = async (orderData: any) => {
  try {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      throw new Error("Order creation failed");
    }

    return await res.json();
  } catch (error) {
    console.error("Qikink order error:", error);
    throw error;
  }
};
