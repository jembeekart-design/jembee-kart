'use client';

import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [themeColor, setThemeColor] = useState("#6366f1");
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);

    // Dummy data (later Firestore)
    setCategories(["T-Shirts", "Hoodies", "Mugs"]);
  }, []);

  const addCategory = () => {
    if (!newCategory) return;
    setCategories((prev) => [...prev, newCategory]);
    setNewCategory("");
  };

  const deleteCategory = (name: string) => {
    setCategories((prev) =>
      prev.filter((cat) => cat !== name)
    );
  };

  return (
    <div className="space-y-6 text-white">
      {/* Title */}
      <h1 className="text-3xl font-bold">
        📂 Categories
      </h1>

      {/* Add Category */}
      <div className="glass p-5 rounded-2xl flex gap-3">
        <input
          type="text"
          placeholder="Enter category name..."
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="flex-1 p-3 rounded-xl bg-white/10 border border-white/20 outline-none"
        />

        <button
          onClick={addCategory}
          className="px-5 py-2 rounded-xl font-medium"
          style={{
            background: themeColor,
            boxShadow: `0 0 20px ${themeColor}55`,
          }}
        >
          Add
        </button>
      </div>

      {/* Category List */}
      <div className="glass p-5 rounded-2xl space-y-3">
        {categories.length === 0 && (
          <p className="opacity-50 text-sm">
            No categories yet
          </p>
        )}

        {categories.map((cat, index) => (
          <div
            key={index}
            className="flex justify-between items-center border-b border-white/10 pb-2"
          >
            <span>{cat}</span>

            <button
              onClick={() => deleteCategory(cat)}
              className="px-3 py-1 rounded-lg text-sm bg-red-500/30 text-red-400"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="glass p-4 rounded-xl text-sm opacity-70">
        Categories help organize Qikink products and improve filtering on your store.
      </div>
    </div>
  );
}
