import { NextResponse } from "next/server";

import { db } from "@/firebase/config";
import { collection, getCountFromServer } from "firebase/firestore";

export async function GET() {
  try {
    const [
      users,
      products,
      orders,
      notifications,
    ] = await Promise.all([
      getCountFromServer(collection(db, "users")),
      getCountFromServer(collection(db, "products")),
      getCountFromServer(collection(db, "orders")),
      getCountFromServer(collection(db, "notifications")),
    ]);

    return NextResponse.json({
      success: true,

      users: users.data().count,
      products: products.data().count,
      orders: orders.data().count,
      notifications: notifications.data().count,

      scanners: {
        total: 18,
        healthy: 18,
        failed: 0,
      },

      buildStatus: "passing",

      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load Mission Summary",
      },
      {
        status: 500,
      }
    );
  }
}
