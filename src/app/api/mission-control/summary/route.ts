import { NextResponse } from "next/server";
import { db } from "@/firebase/config";
import { collection, getCountFromServer } from "firebase/firestore";

export async function GET() {
  try {
    const users = await getCountFromServer(collection(db, "users"));
    console.log("Users OK");

    const products = await getCountFromServer(collection(db, "products"));
    console.log("Products OK");

    const orders = await getCountFromServer(collection(db, "orders"));
    console.log("Orders OK");

    const notifications = await getCountFromServer(
      collection(db, "notifications")
    );
    console.log("Notifications OK");

    return NextResponse.json({
      success: true,
      users: users.data().count,
      products: products.data().count,
      orders: orders.data().count,
      notifications: notifications.data().count,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: String(err),
        message: err?.message,
        code: err?.code,
      },
      { status: 500 }
    );
  }
}
