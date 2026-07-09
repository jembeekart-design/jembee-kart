"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

import {
  Ticket,
  Plus,
  Trash2,
  Percent,
  Save,
  Calendar
} from "lucide-react";

import { db } from "@/firebase/config";

interface CouponData {
  id?: string;
  code: string;
  discount: string;
  expiry: string;
  createdAt?: any;
}

export default function CouponsGeneratorPage() {

  const [couponCode, setCouponCode] =
    useState("");

  const [discount, setDiscount] =
    useState("");

  const [expiry, setExpiry] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [coupons, setCoupons] =
    useState<CouponData[]>([]);

  useEffect(() => {

    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "coupons"
        ),
        (snapshot) => {

          const data:
            CouponData[] = [];

          snapshot.forEach((doc) => {

            data.push({
              id: doc.id,
              ...doc.data()
            } as CouponData);

          });

          setCoupons(data);

          setLoading(false);

        }
      );

    return () =>
      unsubscribe();

  }, []);

  async function createCoupon() {

    if (
      !couponCode ||
      !discount ||
      !expiry
    ) {

      alert(
        "Fill all fields"
      );

      return;

    }

    try {

      setSaving(true);

      await addDoc(
        collection(
          db,
          "coupons"
        ),
        {
          code: couponCode,
          discount,
          expiry,
          createdAt:
            serverTimestamp()
        }
      );

      setCouponCode("");

      setDiscount("");

      setExpiry("");

      alert(
        "Coupon Created"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  async function deleteCoupon(
    id: string
  ) {

    try {

      await deleteDoc(
        doc(
          db,
          "coupons",
          id
        )
      );

    } catch (error) {

      console.log(error);

    }
  }

  function generateCode() {

    const code =
      "JEMBEE" +
      Math.floor(
        Math.random() *
        100000
      );

    setCouponCode(code);

  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-black text-[var(--button-text-color)]">

        Loading...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--success-color)]">

          <Ticket size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Coupons Generator
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Create & manage discount coupons
          </p>

        </div>

      </div>

      {/* CREATE COUPON */}

      <div className="rounded-[30px] bg-[#151515] p-5">

        <h2 className="mb-5 text-2xl font-black">

          Create Coupon

        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm text-gray-400">

              Coupon Code

            </label>

            <div className="flex gap-3">

              <input
                type="text"
                value={couponCode}
                onChange={(e) =>
                  setCouponCode(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl bg-black px-4 py-4 outline-none"
              />

              <button
                onClick={
                  generateCode
                }
                className="rounded-2xl bg-[var(--success-color)] px-5 font-bold text-[var(--text-color)]"
              >

                Generate

              </button>

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm text-gray-400">

              Discount %

            </label>

            <div className="flex items-center gap-3 rounded-2xl bg-black px-4">

              <Percent size={18} />

              <input
                type="text"
                value={discount}
                onChange={(e) =>
                  setDiscount(
                    e.target.value
                  )
                }
                className="w-full bg-transparent py-4 outline-none"
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm text-gray-400">

              Expiry Date

            </label>

            <div className="flex items-center gap-3 rounded-2xl bg-black px-4">

              <Calendar size={18} />

              <input
                type="date"
                value={expiry}
                onChange={(e) =>
                  setExpiry(
                    e.target.value
                  )
                }
                className="w-full bg-transparent py-4 outline-none"
              />

            </div>

          </div>

        </div>

        <button
          onClick={
            createCoupon
          }
          disabled={saving}
          className="mt-6 flex items-center gap-2 rounded-2xl bg-[var(--success-color)] px-5 py-4 font-bold text-[var(--text-color)]"
        >

          <Save size={18} />

          {saving
            ? "Creating..."
            : "Create Coupon"}

        </button>

      </div>

      {/* COUPONS */}

      <div className="mt-6 space-y-5">

        {coupons.length === 0 && (

          <div className="rounded-[30px] bg-[#151515] p-10 text-center">

            No Coupons Found

          </div>

        )}

        {coupons.map(
          (coupon) => (

            <div
              key={coupon.id}
              className="rounded-[30px] bg-[#151515] p-5"
            >

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <h2 className="text-3xl font-black text-green-400">

                    {coupon.code}

                  </h2>

                  <p className="mt-2 text-gray-400">

                    Discount:
                    {" "}
                    {coupon.discount}%

                  </p>

                  <p className="mt-1 text-gray-400">

                    Expiry:
                    {" "}
                    {coupon.expiry}

                  </p>

                </div>

                <button
                  onClick={() =>
                    deleteCoupon(
                      coupon.id!
                    )
                  }
                  className="flex items-center gap-2 rounded-2xl bg-[var(--danger-color)] px-5 py-3 font-bold"
                >

                  <Trash2 size={18} />

                  Delete

                </button>

              </div>

            </div>

          )
        )}

      </div>

    </main>

  );
}
