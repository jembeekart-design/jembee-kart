"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, MapPin, Loader2, Home, CheckCircle2 } from "lucide-react";

export default function AddressPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      try {
        const addressRef = doc(db, "users", user.uid, "addresses", "default");
        const addressSnap = await getDoc(addressRef);
        if (addressSnap.exists()) {
          const data = addressSnap.data();
          setForm({
            fullName: data.fullName || "",
            mobile: data.mobile || "",
            address: data.address || "",
            landmark: data.landmark || "",
            city: data.city || "",
            state: data.state || "",
            pincode: data.pincode || "",
          });
        }
      } catch (error) {
        console.error("LOAD_ADDRESS_ERROR:", error);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSaveAddress() {
    // 1. Required Field Validation
    if (!form.fullName.trim() || !form.mobile.trim() || !form.address.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      alert("Please Fill All Required Fields");
      return;
    }

    // 2. Mobile Validation
    if (form.mobile.trim().length !== 10 || isNaN(Number(form.mobile))) {
      alert("Enter Valid 10-digit Mobile Number");
      return;
    }

    // 3. Pincode Validation
    if (form.pincode.trim().length !== 6 || isNaN(Number(form.pincode))) {
      alert("Enter Valid 6-digit Pincode");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) { alert("Please Login First"); return; }

      setLoading(true);
      const addressRef = doc(db, "users", user.uid, "addresses", "default");
      const oldDoc = await getDoc(addressRef);

      await setDoc(
        addressRef,
        {
          ...form,
          userId: user.uid,
          isDefault: true,
          createdAt: oldDoc.exists() ? oldDoc.data().createdAt : serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      alert("Address Saved Successfully");
    } catch (error: any) {
      console.error("ADDRESS_SAVE_ERROR:", error);
      alert("Failed To Save Address");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <div className="sticky top-0 z-20 bg-[var(--card-color)]/80 backdrop-blur-md border-b border-slate-200 px-4 py-6 flex items-center gap-4">
        <button onClick={() => window.history.back()} className="h-11 w-11 rounded-2xl bg-slate-100 flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Delivery Address</h1>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        {form.address && (
          <div className="bg-green-50 border border-green-200 rounded-3xl p-5 mb-6">
            <h3 className="font-bold text-green-700 flex items-center gap-2">
              <CheckCircle2 size={18} /> Saved Address
            </h3>
            <p className="mt-2 text-sm font-semibold text-slate-800">{form.fullName}</p>
            <p className="text-sm text-slate-700">{form.mobile}</p>
            <p className="text-sm text-slate-700">{form.address}</p>
            <p className="text-sm text-slate-700">{form.city}, {form.state} - {form.pincode}</p>
          </div>
        )}

        <div className="bg-[var(--card-color)] rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-violet-100 rounded-2xl text-violet-600"><Home size={24} /></div>
            <h2 className="text-xl font-bold text-slate-800">Shipping Details</h2>
          </div>

          <input type="text" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} className="w-full bg-slate-50 rounded-2xl border border-slate-200 px-6 py-4 outline-none focus:border-violet-400" />
          <input type="tel" name="mobile" placeholder="Mobile Number" value={form.mobile} onChange={handleChange} className="w-full bg-slate-50 rounded-2xl border border-slate-200 px-6 py-4 outline-none focus:border-violet-400" />
          <textarea name="address" placeholder="Full Address" value={form.address} onChange={handleChange} rows={3} className="w-full bg-slate-50 rounded-2xl border border-slate-200 px-6 py-4 outline-none focus:border-violet-400" />
          <input type="text" name="landmark" placeholder="Landmark (Optional)" value={form.landmark} onChange={handleChange} className="w-full bg-slate-50 rounded-2xl border border-slate-200 px-6 py-4 outline-none focus:border-violet-400" />
          <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} className="w-full bg-slate-50 rounded-2xl border border-slate-200 px-6 py-4 outline-none focus:border-violet-400" />
          <input type="text" name="state" placeholder="State" value={form.state} onChange={handleChange} className="w-full bg-slate-50 rounded-2xl border border-slate-200 px-6 py-4 outline-none focus:border-violet-400" />
          <input type="text" name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} className="w-full bg-slate-50 rounded-2xl border border-slate-200 px-6 py-4 outline-none focus:border-violet-400" />
          
          <button
            onClick={handleSaveAddress}
            disabled={loading}
            className="w-full mt-6 bg-slate-900 text-[var(--button-text-color)] rounded-2xl py-5 font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <MapPin size={20} />}
            {loading ? "Saving..." : "Save Delivery Address"}
          </button>
        </div>
      </div>
    </main>
  );
}
