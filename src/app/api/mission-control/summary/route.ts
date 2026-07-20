import { NextResponse } from "next/server";
import { db } from "@/firebase/config";
import { collection, getDocs } from "firebase/firestore";

export async function GET() {
  try {
    const [users, products, orders, notifications] =
      await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "products")),
        getDocs(collection(db, "orders")),
        getDocs(collection(db, "notifications")),
      ]);

    return NextResponse.json({
      success: true,

      generatedAt: new Date().toISOString(),
      duration: 0,

      users: users.size,
      products: products.size,
      orders: orders.size,
      notifications: notifications.size,

      scanners: {
        firestore: {
          scannedFiles:
            users.size +
            products.size +
            orders.size +
            notifications.size,

          collections: 4,
        },

        duplicate: {
          duplicates: 0,
          duplicateGroups: 0,
        },

        rules: {
          issueCount: 0,
        },
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        success: false,
        message: e?.message,
      },
      {
        status: 500,
      }
    );
  }
}
