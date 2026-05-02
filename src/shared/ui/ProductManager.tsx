"use client";

import { useState } from "react";

export const ProductManager = () => {
  const [products, setProducts] = useState<string[]>([]);
  const [name, setName] = useState("");

  const addProduct = () => {
    if (!name) return;
    setProducts([...products, name]);
    setName("");
  };

  return (
    <div className="glass p-5 rounded-xl mt-6">
      <h2 className="mb-4">Product Manager</h2>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product name"
          className="p-2 rounded bg-black/30 border border-white/20"
        />
        <button
          onClick={addProduct}
          className="px-4 bg-primary rounded"
        >
          Add
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {products.map((p, i) => (
          <li key={i}>• {p}</li>
        ))}
      </ul>
    </div>
  );
};
