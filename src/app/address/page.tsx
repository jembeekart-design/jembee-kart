"use client";

import { useState } from "react";
import { auth, db } from "@/firebase/config";

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  MapPin,
  Loader2,
  ArrowLeft,
} from "lucide-react";

import { useRouter } from "next/navigation";

export default function AddressPage() {
  const router = useRouter();

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
        !form.fullName ||
        !form.mobile ||
        !form.address ||
        !form.city ||
        !form.state ||
        !form.pincode
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
        ...form,
        userId: user.uid,
        isDefault: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      alert("Address Saved Successfully");

      router.push("/checkout");
    } catch (error: any) {
      console.error("ADDRESS_SAVE_ERROR:", error);

      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="sticky top-0 z-20 bg-white border-b px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 className="text-xl font-black text-slate-800">
          Save Address
        </h1>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            className="w-full border rounded-2xl p-3"
          />

          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number"
            value={form.mobile}
            onChange={handleChange}
            className="w-full border rounded-2xl p-3"
          />

          <textarea
            name="address"
            placeholder="Full Address"
            value={form.address}
            onChange={handleChange}
            className="w-full border rounded-2xl p-3 h-24"
          />

          <input
            type="text"
            name="landmark"
            placeholder="Landmark"
            value={form.landmark}
            onChange={handleChange}
            className="w-full border rounded-2xl p-3"
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            className="w-full border rounded-2xl p-3"
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            value={form.state}
            onChange={handleChange}
            className="w-full border rounded-2xl p-3"
          />

          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            value={form.pincode}
            onChange={handleChange}
            className="w-full border rounded-2xl p-3"
          />

          <button
            onClick={handleSaveAddress}
            disabled={loading}
            className="w-full bg-violet-600 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <MapPin size={18} />
                Save Address
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
