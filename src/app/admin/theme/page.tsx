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
          // Document nahi mila, toh default data ke saath bana do
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

  // ... (Baaki ThemeSection aur return logic pehle jaisa hi rahega)
