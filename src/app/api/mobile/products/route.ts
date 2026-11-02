import { NextRequest, NextResponse } from "next/server";
import { FieldPath } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/admin";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  try {
    const db = getAdminDb();
    const cursor = req.nextUrl.searchParams.get("cursor")?.trim();
    if (cursor && (cursor.length > 1500 || cursor.includes("/"))) {
      return NextResponse.json({ success: false, error: "Invalid cursor" }, { status: 400 });
    }
    let query = db.collection("products").where("visible", "==", true).orderBy(FieldPath.documentId()).limit(PAGE_SIZE + 1);
    if (cursor) query = query.startAfter(cursor);
    const snapshot = await query.get();
    const hasMore = snapshot.docs.length > PAGE_SIZE;
    const page = snapshot.docs.slice(0, PAGE_SIZE);
    const products = page.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: typeof data.name === "string" ? data.name : typeof data.title === "string" ? data.title : "",
        title: typeof data.title === "string" ? data.title : typeof data.name === "string" ? data.name : "",
        description: typeof data.description === "string" ? data.description : "",
        price: Number.isFinite(Number(data.price)) ? Number(data.price) : 0,
        salePrice: Number.isFinite(Number(data.salePrice)) ? Number(data.salePrice) : null,
        images: Array.isArray(data.images) ? data.images.filter((v: unknown) => typeof v === "string").slice(0, 10) : [],
        image: typeof data.image === "string" ? data.image : "",
        category: typeof data.category === "string" ? data.category : "",
        slug: typeof data.slug === "string" ? data.slug : "",
        stock: Number.isFinite(Number(data.stock)) ? Number(data.stock) : 0,
        visible: true,
      };
    });
    return NextResponse.json({ success: true, products, nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null, hasMore });
  } catch (error) {
    console.error("MOBILE PRODUCTS API ERROR:", error);
    return NextResponse.json({ success: false, products: [], error: "Failed to load products" }, { status: 500 });
  }
}
