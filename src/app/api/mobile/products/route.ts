import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getAdminDb();

    const snapshot = await db
      .collection("products")
      .where("visible", "==", true)
      .get();

    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("MOBILE PRODUCTS API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        products: [],
        error: "Failed to load products",
      },
      { status: 500 }
    );
  }
}
