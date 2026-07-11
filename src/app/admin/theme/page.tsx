"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

interface ThemeData { [key: string]: any; }

export default function ThemePage() {
  const [headerTheme, setHeaderTheme] = useState<ThemeData>({});
  const [sectionTheme, setSectionTheme] = useState<ThemeData>({}); // Naya: Section Color state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTheme() {
      try {
        const headerRef = doc(db, "homepage_sections", "header_section");
        const sectionRef = doc(db, "homepage_sections", "section_style"); // Section collection ref

        const [headerSnap, sectionSnap] = await Promise.all([
          getDoc(headerRef),
          getDoc(sectionRef)
        ]);

        if (headerSnap.exists()) setHeaderTheme(headerSnap.data());
        if (sectionSnap.exists()) setSectionTheme(sectionSnap.data());
      } catch (error) { console.log(error); } 
      finally { setLoading(false); }
    }
    fetchTheme();
  }, []);

  async function updateTheme(collectionName: string, documentId: string, field: string, value: string) {
    try {
      const ref = doc(db, collectionName, documentId);
      await updateDoc(ref, { [field]: value });
      document.documentElement.style.setProperty(`--${field}`, value);
    } catch (error) { console.log(error); }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <h1 className="mb-8 text-center text-3xl font-black">JembeeKart Theme Builder</h1>

      {/* HEADER SECTION */}
      <ThemeSection
        title="Header Settings"
        data={headerTheme}
        setData={setHeaderTheme}
        collectionName="homepage_sections"
        documentId="header_section"
        updateTheme={updateTheme}
      />

      {/* SECTION SETTINGS (Categories/Cards) */}
      <ThemeSection
        title="Section Styles"
        data={sectionTheme}
        setData={setSectionTheme}
        collectionName="homepage_sections"
        documentId="section_style"
        updateTheme={updateTheme}
      />
    </main>
  );
}

function ThemeSection({ title, data, setData, collectionName, documentId, updateTheme }: any) {
  return (
    <div className="mb-8 rounded-[30px] p-6 shadow-xl bg-white border border-gray-200">
      <h2 className="mb-6 text-2xl font-black text-gray-800">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(data).map(([key, value]: any) => {
          if (typeof value !== "string" || !value.startsWith("#")) return null;

          return (
            <div key={key} className="rounded-[24px] bg-gray-50 p-4 border border-gray-100">
              <label className="block mb-2 font-bold text-sm uppercase text-gray-500">
                {key.replace(/([A-Z])/g, " $1")}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={value}
                  onChange={async (e) => {
                    const newColor = e.target.value;
                    setData((prev: any) => ({ ...prev, [key]: newColor }));
                    await updateTheme(collectionName, documentId, key, newColor);
                  }}
                  className="h-12 w-16 cursor-pointer rounded-lg border-none bg-transparent"
                />
                <span className="font-mono text-sm">{value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
