"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  Menu,
  Plus,
  Trash2,
  Save,
  MoveVertical,
  Link2
} from "lucide-react";

import { db } from "@/firebase/config";

interface NavItem {
  id: number;
  label: string;
  path: string;
  visible: boolean;
}

export default function NavigationPage() {

  const [items, setItems] =
    useState<NavItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [label, setLabel] =
    useState("");

  const [path, setPath] =
    useState("");

  useEffect(() => {

    fetchNavigation();

  }, []);

  async function fetchNavigation() {

    try {

      const ref = doc(
        db,
        "admin_settings",
        "navigation"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setItems(
          snap.data()
            .items || []
        );

      } else {

        setItems([
          {
            id: 1,
            label: "Home",
            path: "/",
            visible: true
          },
          {
            id: 2,
            label: "Products",
            path: "/products",
            visible: true
          }
        ]);

      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  }

  async function saveNavigation() {

    try {

      setSaving(true);

      await setDoc(
        doc(
          db,
          "admin_settings",
          "navigation"
        ),
        {
          items
        }
      );

      alert(
        "Navigation Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function addItem() {

    if (
      !label ||
      !path
    ) {
      return;
    }

    const newItem = {
      id: Date.now(),
      label,
      path,
      visible: true
    };

    setItems((prev) => [
      ...prev,
      newItem
    ]);

    setLabel("");
    setPath("");
  }

  function removeItem(
    id: number
  ) {

    setItems((prev) =>
      prev.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  function toggleVisible(
    id: number
  ) {

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              visible:
                !item.visible
            }
          : item
      )
    );
  }

  function moveUp(
    index: number
  ) {

    if (index === 0) {
      return;
    }

    const updated = [
      ...items
    ];

    [
      updated[index - 1],
      updated[index]
    ] = [
      updated[index],
      updated[index - 1]
    ];

    setItems(updated);
  }

  function moveDown(
    index: number
  ) {

    if (
      index ===
      items.length - 1
    ) {
      return;
    }

    const updated = [
      ...items
    ];

    [
      updated[index + 1],
      updated[index]
    ] = [
      updated[index],
      updated[index + 1]
    ];

    setItems(updated);
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

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--primary-color)]">

            <Menu size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Navigation Manager
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Control navbar & menu links
            </p>

          </div>

        </div>

        <button
          onClick={saveNavigation}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-[var(--primary-color)] px-5 py-3 font-bold"
        >

          <Save size={18} />

          {saving
            ? "Saving..."
            : "Save"}

        </button>

      </div>

      {/* ADD ITEM */}

      <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

        <h2 className="text-2xl font-black">
          Add Navigation Link
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">

          <input
            type="text"
            placeholder="Menu Label"
            value={label}
            onChange={(e) =>
              setLabel(
                e.target.value
              )
            }
            className="rounded-2xl bg-[var(--card-color)] px-4 py-4 outline-none"
          />

          <input
            type="text"
            placeholder="/path"
            value={path}
            onChange={(e) =>
              setPath(
                e.target.value
              )
            }
            className="rounded-2xl bg-[var(--card-color)] px-4 py-4 outline-none"
          />

        </div>

        <button
          onClick={addItem}
          className="mt-5 flex items-center gap-2 rounded-2xl bg-[var(--primary-color)] px-5 py-3 font-bold"
        >

          <Plus size={18} />

          Add Menu

        </button>

      </div>

      {/* NAV ITEMS */}

      <div className="mt-6 space-y-5">

        {items.map(
          (
            item,
            index
          ) => (

            <div
              key={item.id}
              className="rounded-[30px] bg-[var(--primary-color)] p-5"
            >

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--card-color)]">

                    <Link2
                      size={24}
                      className="text-[var(--primary-color)]"
                    />

                  </div>

                  <div>

                    <h2 className="text-2xl font-black">
                      {item.label}
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted-text-color)]">
                      {item.path}
                    </p>

                    <div
                      className={`mt-3 inline-flex rounded-full px-4 py-2 text-sm font-bold ${
                        item.visible
                          ? "bg-[var(--success-color)]"
                          : "bg-[var(--danger-color)]"
                      }`}
                    >

                      {item.visible
                        ? "Visible"
                        : "Hidden"}

                    </div>

                  </div>

                </div>

                <div className="flex flex-wrap gap-2">

                  <button
                    onClick={() =>
                      moveUp(
                        index
                      )
                    }
                    className="rounded-xl bg-[var(--primary-color)] px-4 py-2 text-sm font-bold"
                  >

                    Up

                  </button>

                  <button
                    onClick={() =>
                      moveDown(
                        index
                      )
                    }
                    className="rounded-xl bg-[var(--primary-color)] px-4 py-2 text-sm font-bold"
                  >

                    Down

                  </button>

                  <button
                    onClick={() =>
                      toggleVisible(
                        item.id
                      )
                    }
                    className="rounded-xl bg-[var(--warning-color)] px-4 py-2 text-sm font-bold"
                  >

                    Toggle

                  </button>

                  <button
                    onClick={() =>
                      removeItem(
                        item.id
                      )
                    }
                    className="rounded-xl bg-[var(--danger-color)] px-4 py-2 text-sm font-bold"
                  >

                    <Trash2
                      size={18}
                    />

                  </button>

                </div>

              </div>

            </div>

          )
        )}

      </div>

    </main>

  );
}
