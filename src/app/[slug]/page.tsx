import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { notFound } from "next/navigation";

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const docRef = doc(db, "dynamic_pages", slug);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists() || !docSnap.data().visible) {
    notFound();
  }

  const data = docSnap.data();

  return (
    <main className="p-8 min-h-screen">
      <h1 className="text-3xl font-black mb-6">{data.title}</h1>
      <div className="prose max-w-none text-[var(--text-color)]">
        {data.content || "No content available."}
      </div>
    </main>
  );
}
