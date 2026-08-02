"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, MapPin, Loader2, Home, CheckCircle2 } from "lucide-react";

export default function AddressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });
  
  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setDataLoading(false);
        return;
      }
      try {
        setDataLoading(true);
        setError(null);
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
      } catch (err) {
        console.error("LOAD_ADDRESS_ERROR:", err);
        setError("Failed to load address. Please try again.");
      } finally {
        setDataLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSaveAddress() {
    if (!form.fullName.trim() || !form.mobile.trim() || !form.address.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      showToast("Please Fill All Required Fields", "error");
      return;
    }

    if (form.mobile.trim().length !== 10 || isNaN(Number(form.mobile))) {
      showToast("Enter Valid 10-digit Mobile Number", "error");
      return;
    }

    if (form.pincode.trim().length !== 6 || isNaN(Number(form.pincode))) {
      showToast("Enter Valid 6-digit Pincode", "error");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) { showToast("Please Login First", "error"); return; }

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

      showToast("Address Saved Successfully", "success");
    } catch (err: any) {
      console.error("ADDRESS_SAVE_ERROR:", err);
      showToast("Failed To Save Address", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--card-color)] pb-24">
      {toast.show && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] text-[var(--button-text-color)] px-6 py-3 rounded-full flex items-center gap-2 text-xs font-bold shadow-xl ${toast.type === "success" ? "bg-[var(--success-color)]" : "bg-[var(--danger-color)]"}`}>
          {toast.message}
        </div>
      )}

      <div className="sticky top-0 z-20 bg-[var(--card-color)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-4 py-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="h-11 w-11 rounded-2xl bg-[var(--card-color)] flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-extrabold text-[var(--text-color)] tracking-tight">Delivery Address</h1>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        {dataLoading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[var(--primary-color)]" /></div>
        ) : error ? (
            <div className="text-[var(--danger-color)] p-4 rounded-2xl bg-[var(--card-color)] text-center">{error}</div>
        ) : form.address && (
          <div className="bg-[var(--success-color)]/10 border border-[var(--success-color)] rounded-3xl p-5 mb-6">
            <h3 className="font-bold text-[var(--success-color)] flex items-center gap-2">
              <CheckCircle2 size={18} /> Saved Address
            </h3>
            <p className="mt-2 text-sm font-semibold text-[var(--text-color)]">{form.fullName}</p>
            <p className="text-sm text-[var(--text-color)]">{form.mobile}</p>
            <p className="text-sm text-[var(--text-color)]">{form.address}</p>
            <p className="text-sm text-[var(--text-color)]">{form.city}, {form.state} - {form.pincode}</p>
          </div>
        )}

        <div className="bg-[var(--card-color)] rounded-[40px] shadow-xl border border-[var(--border-color)] p-8 space-y-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[var(--primary-color)] rounded-2xl text-[var(--primary-color)]"><Home size={24} /></div>
            <h2 className="text-xl font-bold text-[var(--text-color)]">Shipping Details</h2>
          </div>

          <label htmlFor="fullName" className="sr-only">Full Name</label>
          <input id="fullName" type="text" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} className="w-full bg-[var(--card-color)] rounded-2xl border border-[var(--border-color)] px-6 py-4 outline-none focus:border-[var(--primary-color)]" />
          
          <label htmlFor="mobile" className="sr-only">Mobile Number</label>
          <input id="mobile" type="tel" name="mobile" placeholder="Mobile Number" value={form.mobile} onChange={handleChange} className="w-full bg-[var(--card-color)] rounded-2xl border border-[var(--border-color)] px-6 py-4 outline-none focus:border-[var(--primary-color)]" />
          
          <label htmlFor="address" className="sr-only">Full Address</label>
          <textarea id="address" name="address" placeholder="Full Address" value={form.address} onChange={handleChange} rows={3} className="w-full bg-[var(--card-color)] rounded-2xl border border-[var(--border-color)] px-6 py-4 outline-none focus:border-[var(--primary-color)]" />
          
          <label htmlFor="landmark" className="sr-only">Landmark</label>
          <input id="landmark" type="text" name="landmark" placeholder="Landmark (Optional)" value={form.landmark} onChange={handleChange} className="w-full bg-[var(--card-color)] rounded-2xl border border-[var(--border-color)] px-6 py-4 outline-none focus:border-[var(--primary-color)]" />
          
          <label htmlFor="city" className="sr-only">City</label>
          <input id="city" type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} className="w-full bg-[var(--card-color)] rounded-2xl border border-[var(--border-color)] px-6 py-4 outline-none focus:border-[var(--primary-color)]" />
          
          <label htmlFor="state" className="sr-only">State</label>
          <input id="state" type="text" name="state" placeholder="State" value={form.state} onChange={handleChange} className="w-full bg-[var(--card-color)] rounded-2xl border border-[var(--border-color)] px-6 py-4 outline-none focus:border-[var(--primary-color)]" />
          
          <label htmlFor="pincode" className="sr-only">Pincode</label>
          <input id="pincode" type="text" name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} className="w-full bg-[var(--card-color)] rounded-2xl border border-[var(--border-color)] px-6 py-4 outline-none focus:border-[var(--primary-color)]" />
          
          <button
            onClick={handleSaveAddress}
            disabled={loading}
            className="w-full mt-6 bg-[var(--card-color)] text-[var(--button-text-color)] rounded-2xl py-5 font-bold text-lg flex items-center justify-center gap-2 hover:bg-[var(--card-color)] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <MapPin size={20} />}
            {loading ? "Saving..." : "Save Delivery Address"}
          </button>
        </div>
      </div>
    </main>
  );
}
