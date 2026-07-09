"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc
} from "firebase/firestore";

import {
  Users,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  DollarSign
} from "lucide-react";

import { db } from "@/firebase/config";

interface AffiliateItem {
  id: string;
  name: string;
  email: string;
  commission: string;
  totalEarned: string;
  visible: boolean;
}

export default function AffiliatePage() {

  const [affiliates, setAffiliates] =
    useState<AffiliateItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  useEffect(() => {

    fetchAffiliates();

  }, []);

  async function fetchAffiliates() {

    try {

      const q = query(
        collection(db, "affiliates"),
        orderBy("name", "asc")
      );

      const snapshot =
        await getDocs(q);

      const data =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as AffiliateItem[];

      setAffiliates(data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  }

  async function createAffiliate() {

    try {

      setCreating(true);

      await addDoc(
        collection(db, "affiliates"),
        {
          name: "New Affiliate",
          email: "affiliate@gmail.com",
          commission: "10%",
          totalEarned: "0",
          visible: true
        }
      );

      fetchAffiliates();

    } catch (error) {

      console.log(error);

    } finally {

      setCreating(false);

    }
  }

  async function updateAffiliate(
    id: string,
    field: string,
    value: any
  ) {

    try {

      await updateDoc(
        doc(db, "affiliates", id),
        {
          [field]: value
        }
      );

      setAffiliates((prev) =>
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

  async function deleteAffiliate(
    id: string
  ) {

    try {

      await deleteDoc(
        doc(db, "affiliates", id)
      );

      setAffiliates((prev) =>
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

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-black">
            Affiliate Manager
          </h1>

          <p className="mt-2 text-sm text-[var(--muted-text-color)]">
            Manage affiliates and commissions
          </p>

        </div>

        <button
          onClick={createAffiliate}
          disabled={creating}
          className="flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold"
        >

          <Plus size={18} />

          Add Affiliate

        </button>

      </div>

      {/* AFFILIATES */}

      <div className="space-y-5">

        {affiliates.map((affiliate) => (

          <div
            key={affiliate.id}
            className="rounded-[30px] border border-white/10 bg-[#151515] p-5"
          >

            <div className="flex items-start justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600">

                  <Users size={24} />

                </div>

                <div>

                  <h2 className="text-xl font-black">
                    {affiliate.name}
                  </h2>

                  <p className="text-sm text-[var(--muted-text-color)]">
                    {affiliate.email}
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2">

                <button
                  onClick={() =>
                    updateAffiliate(
                      affiliate.id,
                      "visible",
                      !affiliate.visible
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--card-color)]/10"
                >

                  {affiliate.visible ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}

                </button>

                <button
                  onClick={() =>
                    deleteAffiliate(
                      affiliate.id
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--danger-color)]/20 text-[var(--danger-color)]"
                >

                  <Trash2 size={18} />

                </button>

              </div>

            </div>

            {/* INPUTS */}

            <div className="mt-5 grid gap-4">

              <InputField
                label="Affiliate Name"
                value={affiliate.name}
                onChange={(value) =>
                  updateAffiliate(
                    affiliate.id,
                    "name",
                    value
                  )
                }
              />

              <InputField
                label="Email"
                value={affiliate.email}
                onChange={(value) =>
                  updateAffiliate(
                    affiliate.id,
                    "email",
                    value
                  )
                }
              />

              <InputField
                label="Commission"
                value={affiliate.commission}
                onChange={(value) =>
                  updateAffiliate(
                    affiliate.id,
                    "commission",
                    value
                  )
                }
              />

              <InputField
                label="Total Earned"
                value={affiliate.totalEarned}
                onChange={(value) =>
                  updateAffiliate(
                    affiliate.id,
                    "totalEarned",
                    value
                  )
                }
              />

            </div>

            {/* LIVE CARD */}

            <div className="mt-6 rounded-[26px] bg-gradient-to-r from-violet-600 to-fuchsia-500 p-5">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-2xl font-black">
                    {affiliate.name}
                  </h2>

                  <p className="mt-1 text-sm text-[var(--button-text-color)]/80">
                    {affiliate.email}
                  </p>

                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--card-color)]/20">

                  <DollarSign size={24} />

                </div>

              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl bg-[var(--card-color)]/10 p-4">

                <div>

                  <p className="text-sm text-[var(--button-text-color)]/70">
                    Commission
                  </p>

                  <h3 className="text-xl font-black">
                    {affiliate.commission}
                  </h3>

                </div>

                <div>

                  <p className="text-sm text-[var(--button-text-color)]/70">
                    Earned
                  </p>

                  <h3 className="text-xl font-black">
                    ₹{affiliate.totalEarned}
                  </h3>

                </div>

              </div>

            </div>

          </div>

        ))}

      </div>

    </main>
  );
}

function InputField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {

  return (

    <div>

      <p className="mb-2 text-sm font-bold">
        {label}
      </p>

      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className="w-full rounded-2xl border border-white/10 bg-[#1e1e1e] px-4 py-3 text-sm text-[var(--button-text-color)] outline-none"
      />

    </div>

  );
}
