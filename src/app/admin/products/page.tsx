"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { 
  Plus, Package2, Trash2, Pencil, Eye, EyeOff, 
  UploadCloud, Menu, Search, Settings, Home, Grid, ChevronRight
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
  const [selectedColor, setSelectedColor] = useState("Purple");
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
    if (!title || !sku || !price) {
      alert("Please fill necessary fields (Title, SKU & Base Price)");
      return;
    }
    await addDoc(collection(db, "products"), {
      title,
      category,
      productType,
      description,
      price: Number(price),
      discountPrice: Number(discountPrice) || 0,
      stock: Number(stock) || 0,
      sku,
      images: [],
      videos: [],
      visible: true
    });

    // Reset Form & Redirect smoothly
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
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteDoc(doc(db, "products", id));
    }
  }

  function toggleSize(size: string) {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased pb-24 selection:bg-indigo-100">
      
      {/* PREMIUM LIGHT HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-5 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button className="text-slate-500 hover:text-slate-800 transition-colors">
            <Menu size={22} />
          </button>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900">POD Connect</h1>
            <p className="text-[10px] text-indigo-600 font-medium tracking-wide uppercase">Admin Suite</p>
          </div>
        </div>
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-indigo-200">
          SI
        </div>
      </header>

      <div className="px-4 py-5 max-w-md mx-auto">
        
        {/* LIGHT SEGMENTED CONTROL TABS */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 mb-6">
          <button
            onClick={() => setActiveTab("add")}
            className={`flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all ${
              activeTab === "add" 
                ? "bg-white text-indigo-600 shadow-[0_4px_12px_rgba(79,70,229,0.1)] border border-slate-200/40" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Plus size={15} /> Add Product
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all ${
              activeTab === "products" 
                ? "bg-white text-indigo-600 shadow-[0_4px_12px_rgba(79,70,229,0.1)] border border-slate-200/40" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Package2 size={15} /> My Products 
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'products' ? 'bg-indigo-50 text-indigo-600 font-extrabold' : 'bg-slate-200 text-slate-600'}`}>
              {products.length}
            </span>
          </button>
        </div>

        {/* ======================================================
            VIEW 1: ADD PRODUCT FORM (WHITE APPS LAYOUT)
        ====================================================== */}
        {activeTab === "add" && (
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Create POD Engine Product</h2>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">Qikink & Printrove Active</span>
            </div>
            
            {/* Title & SKU */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">Product Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Samurai Skull Graphic Tee" className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">Vendor SKU Mapping</label>
                <input type="text" value={sku} onChange={e => setSku(e.target.value)} placeholder="e.g., TS-SAM-101" className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">Product Story / Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Premium combed cotton 180 GSM t-shirt with screen print finish..." className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none" />
            </div>

            {/* Price Configurations */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">Base Retail Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-xs font-semibold text-slate-400">₹</span>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="599" className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl p-3 pl-6 text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">Special Offer Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-xs font-semibold text-slate-400">₹</span>
                  <input type="number" value={discountPrice} onChange={e => setDiscountPrice(e.target.value)} placeholder="349" className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl p-3 pl-6 text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all" />
                </div>
              </div>
            </div>

            {/* Classification */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">Category Hub</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all">
                  <option>Men's T-Shirts</option>
                  <option>Women's Wear</option>
                  <option>Hoodies & Sweatshirts</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">Apparel Base Model</label>
                <select value={productType} onChange={e => setProductType(e.target.value)} className="w-full text-xs bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all">
                  <option>Oversized Tee</option>
                  <option>Standard Fit Tee</option>
                  <option>Premium Hoodie</option>
                </select>
              </div>
            </div>

            {/* Custom Variants Engine */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-3">
              <span className="text-[11px] font-bold text-slate-700 block">Product Structure Sync</span>
              <div className="flex justify-between items-center gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block mb-1">Color Block</span>
                  <div className="flex gap-2">
                    {["#6366F1", "#0F172A", "#EC4899", "#F8FAFC"].map((hex, i) => (
                      <button key={i} type="button" className={`h-5 w-5 rounded-full border-2 ${i === 0 ? 'border-indigo-600 scale-110 shadow-sm' : 'border-white shadow-sm'}`} style={{ backgroundColor: hex }} />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block text-right mb-1">Sizes Selected</span>
                  <div className="flex gap-1 bg-slate-200/60 p-0.5 rounded-lg border border-slate-200/40">
                    {["S", "M", "L", "XL"].map(sz => (
                      <button key={sz} type="button" onClick={() => toggleSize(sz)} className={`text-[10px] font-black px-2 py-1 rounded-md transition-all ${selectedSizes.includes(sz) || sz === "S" ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>{sz}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Media Upload Modules */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-500 block">POD Digital Assets</label>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-24 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-indigo-300 transition-colors">
                  <span className="text-[9px] text-slate-400 font-medium absolute top-1.5 left-2">Front Side</span>
                  <div className="text-xl mt-2 opacity-80 group-hover:scale-110 transition-transform">👕</div>
                </div>
                <div className="h-24 bg-white border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center relative hover:bg-slate-50/50 transition-colors cursor-pointer">
                  <span className="text-[9px] text-slate-400 font-medium absolute top-1.5 left-2">Back Side</span>
                  <Plus size={14} className="text-slate-400 mt-2" />
                </div>
                <div className="h-24 bg-white border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center relative hover:bg-slate-50/50 transition-colors cursor-pointer">
                  <span className="text-[9px] text-slate-400 font-medium absolute top-1.5 left-2">Print File</span>
                  <UploadCloud size={14} className="text-indigo-400 mt-2" />
                </div>
              </div>
            </div>

            {/* Primary Action Suite */}
            <div className="pt-2">
              <button onClick={addProduct} disabled={uploading} className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white text-xs font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.99] transition-all">
                {uploading ? "Pushing Engine..." : "Push to Stores & Live"}
              </button>
              <button type="button" className="w-full text-center text-[11px] text-slate-400 font-semibold mt-3 hover:text-indigo-600 transition-colors">Generate Live Matrix Preview</button>
            </div>
          </div>
        )}

        {/* ======================================================
            VIEW 2: THE MODERN MINIMALIST PRODUCT LIST 
        ====================================================== */}
        {activeTab === "products" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
            
            {/* Category Scrolling Bar */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] font-bold px-4 py-2 rounded-full transition-all border whitespace-nowrap ${
                    selectedCategory === cat 
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                      : "bg-white text-slate-600 border-slate-200/60 hover:border-slate-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-16 text-xs text-slate-400 font-medium">Fetching sync engines...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl text-xs text-slate-400 shadow-sm">
                No active mockups found in this hub.
              </div>
            ) : (
              <div className="grid gap-3.5">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white border border-slate-100/80 rounded-2xl p-3.5 flex gap-4 relative shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-md transition-all">
                    
                    {/* Mockup Frame */}
                    <div className="h-20 w-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center">
                      <img src={product.images?.[0] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=200"} alt="" className="h-full w-full object-cover mix-blend-multiply" />
                    </div>

                    {/* Metadata Panel */}
                    <div className="flex-1 min-w-0 pr-12">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-slate-900 truncate tracking-tight">{product.title}</h3>
                        <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">{product.sku}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{product.productType || "Oversized Fit"}</p>
                      
                      <div className="flex items-baseline gap-1.5 mt-2.5">
                        <span className="text-sm font-black text-slate-900">₹{product.discountPrice || product.price}</span>
                        {product.discountPrice > 0 && <span className="text-[10px] text-slate-400 line-through">₹{product.price}</span>}
                      </div>
                    </div>

                    {/* Premium Clean Actions aligned at the side edge */}
                    <div className="absolute right-3.5 top-3.5 bottom-3.5 flex flex-col justify-between items-end">
                      <button onClick={() => updateProduct(product.id, "visible", !product.visible)} className={`text-xs p-1 rounded-md transition-colors ${product.visible ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
                        {product.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      
                      <div className="flex gap-2 bg-slate-50 border border-slate-100 rounded-lg p-0.5">
                        <button onClick={() => setEditingProductId(product.id)} className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-white rounded transition-all" title="Edit Meta">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => deleteProduct(product.id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-white rounded transition-all" title="Wipe Sync">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ULTRA PRECISE SYSTEM DOCK (LIGHT PREMIUM NAVIGATION) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-t border-slate-100 flex items-center justify-around px-4 text-slate-400 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <button onClick={() => setActiveTab("add")} className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${activeTab === 'add' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}>
          <Home size={20} />
          <span className="text-[9px] tracking-wide">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-slate-600 transition-colors">
          <Search size={20} />
          <span className="text-[9px] tracking-wide">Search</span>
        </button>
        <button onClick={() => setActiveTab("products")} className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${activeTab === 'products' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}>
          <Grid size={20} />
          <span className="text-[9px] tracking-wide">Matrix</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-slate-600 transition-colors">
          <Settings size={20} />
          <span className="text-[9px] tracking-wide">Hub</span>
        </button>
      </nav>

    </main>
  );
}
