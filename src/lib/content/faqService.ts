import { adminDb } from "@/firebase/admin";

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  published: boolean;
  createdAt?: unknown;
}

export async function getPublishedFAQs(): Promise<FAQ[]> {
  const snapshot = await adminDb
    .collection("faqs")
    .where("published", "==", true)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as FAQ[];
}
