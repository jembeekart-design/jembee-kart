"use client";

import { useState } from "react";
import { auth, db } from "@/firebase/config";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  ArrowLeft,
  MapPin,
  Loader2,
} from "lucide-react";

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  async function handleSaveAddress() {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Please Login First");
        return;
      }

      if (
        !form.fullName.trim() ||
        !form.mobile.trim() ||
        !form.address.trim() ||
        !form.city.trim() ||
        !form.state.trim() ||
        !form.pincode.trim()
      ) {
        alert("Please Fill All Required Fields");
        return;
      }

      setLoading(true);

      const addressRef = doc(
        db,
        "users",
        user.uid,
        "addresses",
        "default"
      );

      await setDoc(addressRef, {
        fullName: form.fullName.trim(),
        mobile: form.mobile.trim(),
        address: form.address.trim(),
        landmark: form.landmark.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),

        userId: user.uid,
        isDefault: true,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      alert("Address Saved Successfully");

      // Form Reset
      setForm({
        fullName: "",
        mobile: "",
        address: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
      });
    } catch (error: any) {
      console.error("ADDRESS_SAVE_ERROR:", error);
      alert(error.message || "Failed To Save Address");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 className="text-2xl font-black text-slate-800">
          Save Address
        </h1>
      </div>

      {/* Form */}
      <div className="p-4">
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-5 space-y-4">

          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            className="w-full rounded-3xl border border-slate-300 px-5 py-4 text-lg outline-none"
          />

          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number"
            value={form.mobile}
            onChange={handleChange}
            className="w-full rounded-3xl border border-slate-300 px-5 py-4 text-lg outline-none"
          />

          <textarea
            name="address"
            placeholder="Full Address"
            value={form.address}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-3xl border border-slate-300 px-5 py-4 text-lg outline-none resize-none"
          />

          <input
            type="text"
            name="landmark"
            placeholder="Landmark"
            value={form.landmark}
            onChange={handleChange}
            className="w-full rounded-3xl border border-slate-300 px-5 py-4 text-lg outline-none"
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            className="w-full rounded-3xl border border-slate-300 px-5 py-4 text-lg outline-none"
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            value={form.state}
            onChange={handleChange}
            className="w-full rounded-3xl border border-slate-300 px-5 py-4 text-lg outline-none"
          />

          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            value={form.pincode}
            onChange={handleChange}
            className="w-full rounded-3xl border border-slate-300 px-5 py-4 text-lg outline-none"
          />

          <button
            onClick={handleSaveAddress}
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-3xl py-5 font-black text-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={22}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <MapPin size={22} />
                Save Address
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
