"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { 
  Plus, Package2, Trash2, Pencil, Eye, EyeOff, 
  UploadCloud, Menu, Search, Settings, Home 
} from "lucide-react";
import { db } from "@/firebase/config";

interface Product {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  discountPrice: number;
  stock: number;
  sku: string;
  images: string[];
  videos: string[];
  visible: boolean;
  productType?: string;
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<"products" | "add">("add");
  const [editingProductId, setEditingProductId] = useState("");

  /* FORM STATES */
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Men's T-Shirts");
  const [productType, setProductType] = useState("Oversized Tee");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sku, setSku] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState("Blue");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const data = snapshot.docs.map((document) => ({
        id: document.id,
        ...(document.data() as Omit<Product, "id">)
      }));
      setProducts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const filteredProducts = selectedCategory === "All" ? products : products.filter((p) => p.category === selectedCategory);

  async function addProduct() {
    if (!title || !sku) {
      alert("Please fill necessary fields (Title & SKU)");
      return;
    }
    await addDoc(collection(db, "products"), {
      title,
      category,
      productType,
      description,
      price: Number(price),
      discountPrice: Number(discountPrice),
      stock: Number(stock) || 0,
      sku,
      images: [],
      videos: [],
      visible: true
    });

    // Reset Form
    setTitle("");
    setSku("");
    setDescription("");
    setPrice("");
    setDiscountPrice("");
    setStock("");
    setActiveTab("products");
  }

  async function updateProduct(id: string, field: string, value: any) {
    await updateDoc(doc(db, "products", id), { [field]: value });
  }

  async function deleteProduct(id: string) {
    if (confirm("Delete Product?")) {
      await deleteDoc(doc(db, "products", id));
    }
  }

  function toggleSize(size: string) {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  }

  return (
    <main className="min-h-screen bg-[#070518] text-slate-200 font-sans antialiased pb-24">
      {/* MOBILE HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[#0d0a21]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <button className="text-gray-400 hover:text-white"><Menu size={20} /></button>
          <h1 className="text-base font-bold tracking-wide text-white">POD Connect Dashboard</h1>
        </div>
        <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">C</div>
      </header>

      <div className="px-4 py-4 max-w-md mx-auto">
        {/* TAB NAVIGATION */}
        <div className="grid grid-cols-2 gap-2 bg-[#120e2e] p-1 rounded-xl border border-white/5 mb-5">
          <button
            onClick={() => setActiveTab("add")}
            className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "add" 
                ? "bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.2)]" 
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Plus size={14} /> Add Product
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "products" 
                ? "bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.2)]" 
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Package2 size={14} /> My Products <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-gray-300">{products.length}</span>
          </button>
        </div>

        {/* ======================================================
            ADD PRODUCT FORM VIEW
        ====================================================== */}
        {activeTab === "add" && (
          <div className="bg-[#0f0b26]/90 border border-indigo-500/10 rounded-2xl p-4 shadow-xl space-y-4">
            <h2 className="text-md font-bold text-white/90 border-b border-white/5 pb-2">Add Product</h2>
            
            {/* Title & SKU */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-gray-400 block mb-1">Product Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Samurai Skull Graphic Tee" className="w-full text-xs bg-[#151133] border border-indigo-500/20 rounded-lg p-2 text-white focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-400 block mb-1">Vendor SKU (Qikink/Printrove)</label>
                <input type="text" value={sku} onChange={e => setSku(e.target.value)} placeholder="TS-SAM-101" className="w-full text-xs bg-[#151133] border border-indigo-500/20 rounded-lg p-2 text-white focus:border-indigo-500 outline-none" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[11px] font-medium text-gray-400 block mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Premium cotton t-shirt with limited edition Japanese-inspired design." className="w-full text-xs bg-[#151133] border border-indigo-500/20 rounded-lg p-2 text-white focus:border-indigo-500 outline-none resize-none" />
            </div>

            {/* Price & Discount */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-gray-400 block mb-1">Base Price (₹)</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="₹349" className="w-full text-xs bg-[#151133] border border-indigo-500/20 rounded-lg p-2 text-white focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-400 block mb-1">Discount Price</label>
                <input type="number" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} placeholder="₹299" className="w-full text-xs bg-[#151133] border border-indigo-500/20 rounded-lg p-2 text-white focus:border-indigo-500 outline-none" />
              </div>
            </div>

            {/* Category & Product Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-gray-400 block mb-1">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full text-xs bg-[#151133] border border-indigo-500/20 rounded-lg p-2 text-white focus:border-indigo-500 outline-none">
                  <option>Men's T-Shirts</option>
                  <option>Women's Wear</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-gray-400 block mb-1">Product Type</label>
                <select value={productType} onChange={e => setProductType(e.target.value)} className="w-full text-xs bg-[#151133] border border-indigo-500/20 rounded-lg p-2 text-white focus:border-indigo-500 outline-none">
                  <option>Oversized Tee</option>
                  <option>Standard Hoodie</option>
                </select>
              </div>
            </div>

            {/* Customization (Colors & Sizes) */}
            <div className="border-t border-white/5 pt-3 space-y-3">
              <h3 className="text-xs font-bold text-gray-300">Customization</h3>
              
              <div className="flex justify-between items-center bg-[#151133]/40 p-2 rounded-xl border border-white/5">
                <div>
                  <span className="text-[10px] text-gray-400 block mb-1">Variants</span>
                  <div className="flex gap-1.5">
                    {["#1d4ed8", "#1e293b", "#0f172a", "#ffffff"].map((colorHex, idx) => (
                      <button key={idx} type="button" className={`h-4 w-4 rounded-full border ${idx === 0 ? 'border-purple-400 scale-110' : 'border-transparent'}`} style={{ backgroundColor: colorHex }} />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block text-right mb-1">Size</span>
                  <div className="flex gap-1 bg-[#0f0b26] p-0.5 rounded-md border border-white/5">
                    {["S", "M", "L", "XL"].map(s => (
                      <button key={s} type="button" onClick={() => toggleSize(s)} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${selectedSizes.includes(s) || s === "S" ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Media Block */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-300">Media</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-20 bg-[#151133] border border-indigo-500/30 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <span className="text-[9px] text-gray-400 absolute top-1 left-1.5">Front Mockup</span>
                  <div className="w-10 h-10 bg-black/40 rounded mt-2 flex items-center justify-center text-xs">👕</div>
                </div>
                <div className="h-20 bg-[#151133]/50 border border-dashed border-white/10 rounded-xl flex items-center justify-center relative">
                  <span className="text-[9px] text-gray-500 absolute top-1 left-1.5">Back Mockup</span>
                  <span className="text-gray-500 text-sm">+</span>
                </div>
                <div className="h-20 bg-[#151133]/50 border border-dashed border-white/10 rounded-xl flex items-center justify-center relative">
                  <span className="text-[9px] text-gray-500 absolute top-1 left-1.5">Design File</span>
                  <span className="text-gray-500 text-sm">+</span>
                </div>
              </div>
              <button type="button" className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1.5 text-gray-300">
                <UploadCloud size={12} /> Upload Design / Mockup
              </button>
            </div>

            {/* Submit Actions */}
            <div className="pt-2">
              <button onClick={addProduct} disabled={uploading} className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-xs font-bold py-3 rounded-xl shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-transform">
                {uploading ? "Uploading..." : "Submit & Publish"}
              </button>
              <button type="button" className="w-full text-center text-[10px] text-gray-400 mt-2.5 hover:underline">Preview</button>
            </div>
          </div>
        )}

        {/* ======================================================
            PRODUCTS LIST VIEW
        ====================================================== */}
        {activeTab === "products" && (
          <div className="space-y-4">
            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                    selectedCategory === cat ? "bg-indigo-600 text-white" : "bg-[#151133] text-gray-400 border border-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-10 text-xs text-gray-400">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-[#0f0b26] border border-white/5 rounded-2xl text-xs text-gray-400">No products sync yet.</div>
            ) : (
              <div className="grid gap-3">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-[#0f0b26]/90 border border-white/5 rounded-xl p-3 flex gap-3 relative">
                    <img src={product.images?.[0] || "https://placehold.co/100x100/151133/fff?text=Mockup"} alt="" className="h-20 w-20 rounded-lg object-cover bg-[#151133]" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="text-xs font-bold text-white truncate">{product.title}</h3>
                        <span className="text-[9px] font-mono bg-white/5 px-1 py-0.5 rounded text-indigo-300 shrink-0">{product.sku}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{product.productType || "Standard Product"}</p>
                      
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-xs font-black text-emerald-400">₹{product.discountPrice || product.price}</span>
                        {product.discountPrice && <span className="text-[10px] text-gray-500 line-through">₹{product.price}</span>}
                      </div>
                      <p className="text-[9px] text-gray-400 mt-1">Stock: <span className={product.stock > 0 ? "text-slate-200" : "text-red-400"}>{product.stock}</span></p>
                    </div>

                    {/* Inline Quick Actions for Mobile */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <button onClick={() => updateProduct(product.id, "visible", !product.visible)} className={`p-1.5 rounded-md text-white transition-colors ${product.visible ? "bg-green-600/20 text-green-400" : "bg-gray-600/20 text-gray-400"}`}>
                        {product.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                      <button onClick={() => setEditingProductId(product.id)} className="p-1.5 bg-blue-600/20 text-blue-400 rounded-md hover:bg-blue-600/30">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="p-1.5 bg-red-600/20 text-red-400 rounded-md hover:bg-red-600/30">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAVIGATION ACCORDING TO APPS MOCKUP */}
      <nav className="fixed bottom-0 left-0 right-0 h-14 bg-[#0d0a21] border-t border-white/5 flex items-center justify-around px-6 text-gray-400 z-50">
        <button onClick={() => setActiveTab("add")} className={`flex flex-col items-center gap-0.5 ${activeTab === 'add' ? 'text-indigo-400' : ''}`}><Home size={18} /><span className="text-[9px]">Home</span></button>
        <button className="flex flex-col items-center gap-0.5"><Search size={18} /><span className="text-[9px]">Search</span></button>
        <button onClick={() => setActiveTab("products")} className={`flex flex-col items-center gap-0.5 ${activeTab === 'products' ? 'text-indigo-400' : ''}`}><Package2 size={18} /><span className="text-[9px]">Products</span></button>
        <button className="flex flex-col items-center gap-0.5"><Settings size={18} /><span className="text-[9px]">Settings</span></button>
      </nav>
    </main>
  );
}
