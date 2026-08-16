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
  Flame,
  Trash2,
  Plus,
  Clock3,
  Percent,
  Save,
  Package
} from "lucide-react";

import { db } from "@/firebase/config";

interface FlashSaleItem {
  id?: string;
  productName: string;
  discount: string;
  endTime: string;
  stock: string;
  createdAt?: any;
}

export default function FlashSalePage() {

  const [productName, setProductName] =
    useState("");

  const [discount, setDiscount] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [stock, setStock] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [flashSales, setFlashSales] =
    useState<FlashSaleItem[]>([]);

  useEffect(() => {

    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "flash_sales"
        ),
        (snapshot) => {

          const data:
            FlashSaleItem[] = [];

          snapshot.forEach((doc) => {

            data.push({
              id: doc.id,
              ...doc.data()
            } as FlashSaleItem);

          });

          setFlashSales(data);

          setLoading(false);

        }
      );

    return () =>
      unsubscribe();

  }, []);

  async function createFlashSale() {

    if (
      !productName ||
      !discount ||
      !endTime ||
      !stock
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
          "flash_sales"
        ),
        {
          productName,
          discount,
          endTime,
          stock,
          createdAt:
            serverTimestamp()
        }
      );

      setProductName("");

      setDiscount("");

      setEndTime("");

      setStock("");

      alert(
        "Flash Sale Created"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  async function deleteFlashSale(
    id: string
  ) {

    try {

      await deleteDoc(
        doc(
          db,
          "flash_sales",
          id
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

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--warning-color)]">

          <Flame size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Flash Sale Manager
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Create limited-time product deals
          </p>

        </div>

      </div>

      {/* CREATE */}

      <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

        <h2 className="mb-5 text-2xl font-black">

          Create Flash Sale

        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm text-[var(--muted-text-color)]">

              Product Name

            </label>

            <div className="flex items-center gap-3 rounded-2xl bg-[var(--card-color)] px-4">

              <Package size={18} />

              <input
                type="text"
                value={productName}
                onChange={(e) =>
                  setProductName(
                    e.target.value
                  )
                }
                className="w-full bg-transparent py-4 outline-none"
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm text-[var(--muted-text-color)]">

              Discount %

            </label>

            <div className="flex items-center gap-3 rounded-2xl bg-[var(--card-color)] px-4">

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

            <label className="mb-2 block text-sm text-[var(--muted-text-color)]">

              End Time

            </label>

            <div className="flex items-center gap-3 rounded-2xl bg-[var(--card-color)] px-4">

              <Clock3 size={18} />

              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) =>
                  setEndTime(
                    e.target.value
                  )
                }
                className="w-full bg-transparent py-4 outline-none"
              />

            </div>

          </div>

          <div>

            <label className="mb-2 block text-sm text-[var(--muted-text-color)]">

              Stock Quantity

            </label>

            <input
              type="text"
              value={stock}
              onChange={(e) =>
                setStock(
                  e.target.value
                )
              }
              className="w-full rounded-2xl bg-[var(--card-color)] px-4 py-4 outline-none"
            />

          </div>

        </div>

        <button
          onClick={
            createFlashSale
          }
          disabled={saving}
          className="mt-6 flex items-center gap-2 rounded-2xl bg-[var(--warning-color)] px-5 py-4 font-bold text-[var(--text-color)]"
        >

          <Save size={18} />

          {saving
            ? "Creating..."
            : "Create Flash Sale"}

        </button>

      </div>

      {/* FLASH SALES */}

      <div className="mt-6 space-y-5">

        {flashSales.length === 0 && (

          <div className="rounded-[30px] bg-[var(--primary-color)] p-10 text-center">

            No Flash Sales Found

          </div>

        )}

        {flashSales.map(
          (item) => (

            <div
              key={item.id}
              className="rounded-[30px] bg-[var(--primary-color)] p-5"
            >

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <h2 className="text-3xl font-black text-[var(--warning-color)]">

                    {item.productName}

                  </h2>

                  <p className="mt-2 text-[var(--muted-text-color)]">

                    Discount:
                    {" "}
                    {item.discount}%

                  </p>

                  <p className="mt-1 text-[var(--muted-text-color)]">

                    Stock:
                    {" "}
                    {item.stock}

                  </p>

                  <p className="mt-1 text-[var(--muted-text-color)]">

                    Ends:
                    {" "}
                    {item.endTime}

                  </p>

                </div>

                <button
                  onClick={() =>
                    deleteFlashSale(
                      item.id!
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
