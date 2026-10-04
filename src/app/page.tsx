export const dynamic = "force-dynamic";

import HomePageClient, { type Product } from "@/components/homepage/HomePageClient";
import { getAdminDb } from "@/firebase/admin";

async function getInitialProducts(): Promise<Product[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("products").get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "",
        category: data.category || "",
        price: Number(data.price || 0),
        discountPrice: Number(data.discountPrice || 0),
        images: Array.isArray(data.images) ? data.images : [],
        visible: data.visible === true,
        rating: data.rating ? Number(data.rating) : undefined,
        sold: data.sold ? Number(data.sold) : undefined,
        description: data.description || "",
      } as Product;
    });
  } catch (error) {
    console.error("Error fetching initial products on server:", error);
    return [];
  }
}

export default async function HomePage() {
  const initialProducts = await getInitialProducts();

  return <HomePageClient initialProducts={initialProducts} />;
}
