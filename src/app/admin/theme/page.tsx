"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

const DEFAULT_THEME = {
  headerBackground: "#ffffff",
  searchBarColor: "#f3f4f6",
  buttonColor: "#4f46e5",
  cardBorderColor: "#e5e7eb"
};

export default function ThemePage() {
  const [headerTheme, setHeaderTheme] = useState<any>({});
  const [sectionTheme, setSectionTheme] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initTheme() {
      const collections = [
        { col: "homepage_sections", id: "header_section", setter: setHeaderTheme },
        { col: "homepage_sections", id: "section_style", setter: setSectionTheme }
      ];

      for (const item of collections) {
        const ref = doc(db, item.col, item.id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          item.setter(snap.data());
        } else {
          await setDoc(ref, DEFAULT_THEME);
          item.setter(DEFAULT_THEME);
        }
      }
      setLoading(false);
    }
    initTheme();
  }, []);

  async function updateTheme(collectionName: string, documentId: string, field: string, value: string) {
    const ref = doc(db, collectionName, documentId);
    await updateDoc(ref, { [field]: value });
    document.documentElement.style.setProperty(`--${field}`, value);
  }

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <h1 className="mb-8 text-center text-3xl font-black">JembeeKart Theme Builder</h1>
      <ThemeSection title="Header Settings" data={headerTheme} setData={setHeaderTheme} collectionName="homepage_sections" documentId="header_section" updateTheme={updateTheme} />
      <ThemeSection title="Section Styles" data={sectionTheme} setData={setSectionTheme} collectionName="homepage_sections" documentId="section_style" updateTheme={updateTheme} />
    </main>
  );
}

function ThemeSection({ title, data, setData, collectionName, documentId, updateTheme }: any) {
  return (
    <div className="mb-8 rounded-[30px] p-6 shadow-xl bg-white border border-gray-200">
      <h2 className="mb-6 text-2xl font-black text-gray-800">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(data).map(([key, value]: any) => (
          <div key={key} className="rounded-[24px] bg-gray-50 p-4 border border-gray-100">
            <label className="block mb-2 font-bold text-sm uppercase text-gray-500">{key}</label>
            <input type="color" value={value} onChange={async (e) => {
              const newColor = e.target.value;
              setData((prev: any) => ({ ...prev, [key]: newColor }));
              await updateTheme(collectionName, documentId, key, newColor);
            }} className="h-12 w-full cursor-pointer rounded-lg border-none bg-transparent" />
          </div>
        ))}
      </div>
    </div>
  );
}
