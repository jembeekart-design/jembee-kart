"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc
} from "firebase/firestore";

import {
  Plus,
  Trash2,
  TicketPercent
} from "lucide-react";

import { db } from "@/firebase/config";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: string;
  active: boolean;
  minimumAmount: number;
}

export default function CouponsPage() {

  const [coupons, setCoupons] =
    useState<Coupon[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  useEffect(() => {

    fetchCoupons();

  }, []);

  async function fetchCoupons() {

    try {

      const snapshot =
        await getDocs(
          collection(
            db,
            "coupons"
          )
        );

      const data =
        snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data()
          })
        ) as Coupon[];

      setCoupons(data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  }

  async function createCoupon() {

    try {

      setCreating(true);

      const newCoupon = {
        code: "NEW50",
        discount: 50,
        type: "percentage",
        active: true,
        minimumAmount: 999
      };

      await addDoc(
        collection(
          db,
          "coupons"
        ),
        newCoupon
      );

      fetchCoupons();

    } catch (error) {

      console.log(error);

    } finally {

      setCreating(false);

    }
  }

  async function updateCoupon(
    id: string,
    field: string,
    value: any
  ) {

    try {

      const ref = doc(
        db,
        "coupons",
        id
      );

      await updateDoc(ref, {
        [field]: value
      });

      setCoupons((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                [field]: value
              }
            : item
        )
      );

    } catch (error) {

      console.log(error);

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

      setCoupons((prev) =>
        prev.filter(
          (item) =>
            item.id !== id
        )
      );

    } catch (error) {

      console.log(error);

    }
  }

  if (loading) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--card-color)] text-[var(--button-text-color)]">
        Loading...
      </div>
    );
  }

  return (

    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-black">
            Coupons Manager
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Manage discount coupons
          </p>

        </div>

        <button
          onClick={createCoupon}
          disabled={creating}
          className="flex items-center gap-2 rounded-2xl bg-[var(--primary-color)] px-5 py-3 text-sm font-bold text-[var(--button-text-color)]"
        >

          <Plus size={18} />

          Add Coupon

        </button>

      </div>

      {/* COUPONS */}

      <div className="space-y-5">

        {coupons.map(
          (coupon) => (

            <div
              key={coupon.id}
              className="overflow-hidden rounded-[30px] border border-[var(--border-color)]/10 bg-[var(--primary-color)]"
            >

              {/* TOP */}

              <div className="flex items-center justify-between border-b border-[var(--border-color)]/10 p-4">

                <div className="flex items-center gap-4">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-color)]">

                    <TicketPercent size={28} />

                  </div>

                  <div>

                    <h2 className="text-xl font-black">
                      {coupon.code}
                    </h2>

                    <p className="text-sm text-[var(--muted-text-color)]">
                      {coupon.discount}% OFF
                    </p>

                  </div>

                </div>

                <button
                  onClick={() =>
                    deleteCoupon(
                      coupon.id
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--danger-color)]/20 text-[var(--danger-color)]"
                >

                  <Trash2 size={18} />

                </button>

              </div>

              {/* BODY */}

              <div className="space-y-5 p-4">

                {/* CODE */}

                <div>

                  <p className="mb-2 text-sm font-bold">
                    Coupon Code
                  </p>

                  <input
                    type="text"
                    value={coupon.code}
                    onChange={(e) =>
                      updateCoupon(
                        coupon.id,
                        "code",
                        e.target.value
                      )
                    }
                    className="w-full rounded-2xl border border-[var(--border-color)]/10 bg-[var(--primary-color)] px-4 py-3 outline-none"
                  />

                </div>

                {/* DISCOUNT */}

                <div>

                  <p className="mb-2 text-sm font-bold">
                    Discount %
                  </p>

                  <input
                    type="number"
                    value={
                      coupon.discount
                    }
                    onChange={(e) =>
                      updateCoupon(
                        coupon.id,
                        "discount",
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="w-full rounded-2xl border border-[var(--border-color)]/10 bg-[var(--primary-color)] px-4 py-3 outline-none"
                  />

                </div>

                {/* MINIMUM */}

                <div>

                  <p className="mb-2 text-sm font-bold">
                    Minimum Amount
                  </p>

                  <input
                    type="number"
                    value={
                      coupon.minimumAmount
                    }
                    onChange={(e) =>
                      updateCoupon(
                        coupon.id,
                        "minimumAmount",
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="w-full rounded-2xl border border-[var(--border-color)]/10 bg-[var(--primary-color)] px-4 py-3 outline-none"
                  />

                </div>

                {/* STATUS */}

                <div className="flex items-center justify-between rounded-2xl bg-[var(--primary-color)] p-4">

                  <div>

                    <h2 className="font-bold">
                      Coupon Active
                    </h2>

                    <p className="text-sm text-[var(--muted-text-color)]">
                      Enable or disable
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      updateCoupon(
                        coupon.id,
                        "active",
                        !coupon.active
                      )
                    }
                    className={`rounded-full px-5 py-2 text-sm font-bold ${
                      coupon.active
                        ? "bg-[var(--success-color)]"
                        : "bg-[var(--danger-color)]"
                    }`}
                  >

                    {coupon.active
                      ? "Active"
                      : "Disabled"}

                  </button>

                </div>

                {/* LIVE PREVIEW */}

                <div className="rounded-[28px] bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-color)] p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <h2 className="text-3xl font-black">
                        {coupon.code}
                      </h2>

                      <p className="mt-2 text-sm text-[var(--button-text-color)]/80">
                        Get {
                          coupon.discount
                        }% OFF
                      </p>

                      <p className="mt-2 text-xs text-[var(--button-text-color)]/60">
                        Min Order ₹
                        {
                          coupon.minimumAmount
                        }
                      </p>

                    </div>

                    <div className="rounded-full bg-[var(--card-color)]/20 px-5 py-3 text-lg font-black">

                      {coupon.discount}%

                    </div>

                  </div>

                </div>

              </div>

            </div>

          )
        )}

      </div>

    </main>

  );
}
