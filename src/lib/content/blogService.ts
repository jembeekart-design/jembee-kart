import { adminDb } from "@/firebase/admin";

export interface Blog {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  imageUrl?: string;
  author?: string;
  published: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export async function getPublishedBlogs(): Promise<Blog[]> {
  const snapshot = await adminDb
    .collection("blogs")
    .where("published", "==", true)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Blog[];
}

export async function getPublishedBlogBySlug(
  slug: string
): Promise<Blog | null> {
  const snapshot = await adminDb
    .collection("blogs")
    .where("slug", "==", slug)
    .where("published", "==", true)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];

  return {
    id: doc.id,
    ...doc.data(),
  } as Blog;
}
