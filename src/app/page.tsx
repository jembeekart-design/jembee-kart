export const dynamic = "force-dynamic";

import HomePageClient, { type Product } from "@/components/homepage/HomePageClient";
import { type Slide } from "@/components/homepage/HomepageSlider";
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

async function getInitialSlides(): Promise<Slide[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("homepage_banners").get();
    const data = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "",
        subtitle: data.subtitle || "",
        buttonText: data.buttonText || "",
        buttonLink: data.buttonLink || "",
        backgroundColor: data.backgroundColor || "",
        gradientColor: data.gradientColor || "",
        textColor: data.textColor || "",
        buttonColor: data.buttonColor || "",
        buttonTextColor: data.buttonTextColor || "",
        imageUrl: data.imageUrl || "",
        videoUrl: data.videoUrl || "",
        mediaType: data.mediaType || "",
        visible: data.visible === true,
        position: data.position !== undefined ? Number(data.position) : 0,
        badge: data.badge || "",
      } as Slide;
    });

    return data
      .filter(slide => slide.visible)
      .sort((a, b) => Number(a.position || 0) - Number(b.position || 0));
  } catch (error) {
    console.error("Error fetching initial homepage banners on server:", error);
    return [];
  }
}

export default async function HomePage() {
  const [initialProducts, initialSlides] = await Promise.all([
    getInitialProducts(),
    getInitialSlides(),
  ]);

  return <HomePageClient initialProducts={initialProducts} initialSlides={initialSlides} />;
}
