"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";

import {
  LayoutTemplate,
  Plus,
  Trash2,
  Eye,
  FileText
} from "lucide-react";

interface PageItem {
  id: string;
  title: string;
  slug: string;
  visible: boolean;
}

export default function PagesManagerPage() {

  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    try {
      const querySnapshot = await getDocs(collection(db, "dynamic_pages"));
      const fetchedPages: PageItem[] = [];
      querySnapshot.forEach((doc) => {
        fetchedPages.push({ id: doc.id, ...doc.data() } as PageItem);
      });
      setPages(fetchedPages);
    } catch (error) {
      console.error("Error fetching pages:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createPage() {
    if (!title || !slug) return;
    
    // Check for duplicate slug
    if (pages.some((p) => p.slug === slug)) {
        alert("Page with this slug already exists.");
        return;
    }

    const newPage = {
      title,
      slug,
      visible: true,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "dynamic_pages", slug), newPage);
    setPages((prev) => [...prev, { id: slug, ...newPage } as PageItem]);
    setTitle("");
    setSlug("");
  }

  async function deletePage(id: string) {
    await deleteDoc(doc(db, "dynamic_pages", id));
    setPages((prev) => prev.filter((item) => item.id !== id));
  }

  async function togglePage(page: PageItem) {
    const updatedPage = { ...page, visible: !page.visible };
    await setDoc(doc(db, "dynamic_pages", page.id), updatedPage);
    setPages((prev) => prev.map((p) => (p.id === page.id ? updatedPage : p)));
  }

  if (loading) return <div className="p-4">Loading Pages...</div>;

  return (

    <main className="min-h-screen bg-[var(--color-page-background)] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] theme-primary-bg">

          <LayoutTemplate size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Pages Manager
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Manage custom website pages
          </p>

        </div>

      </div>

      {/* CREATE PAGE */}

      <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

        <h2 className="text-2xl font-black">
          Create New Page
        </h2>

        <div className="mt-5 space-y-4">

          <div className="flex items-center gap-3 rounded-2xl bg-[var(--card-color)] px-4 py-4">

            <FileText
              size={20}
              className="text-[var(--muted-text-color)]"
            />

            <input
              type="text"
              placeholder="Page Title"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              className="w-full bg-transparent outline-none"
            />

          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[var(--card-color)] px-4 py-4">

            <LayoutTemplate
              size={20}
              className="text-[var(--muted-text-color)]"
            />

            <input
              type="text"
              placeholder="page-slug (e.g., privacy)"
              value={slug}
              onChange={(e) =>
                setSlug(
                  e.target.value
                )
              }
              className="w-full bg-transparent outline-none"
            />

          </div>

          <button
            onClick={createPage}
            className="flex items-center gap-2 rounded-2xl theme-primary-bg px-5 py-3 font-bold"
          >

            <Plus size={18} />

            Create Page

          </button>

        </div>

      </div>

      {/* PAGE LIST */}

      <div className="mt-6 space-y-5">

        {pages.map(
          (item) => (

            <div
              key={item.id}
              className="rounded-[30px] bg-[var(--primary-color)] p-5"
            >

              <div className="flex items-center justify-between gap-4">

                <div>

                  <h2 className="text-2xl font-black">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-sm text-[var(--muted-text-color)]">
                    {item.slug}
                  </p>

                  <div className="mt-4 inline-block rounded-full theme-primary-bg px-4 py-2 text-sm font-bold">

                    {item.visible
                      ? "Visible"
                      : "Hidden"}

                  </div>

                </div>

                <div className="flex gap-3">

                  <button
                    onClick={() =>
                      togglePage(
                        item
                      )
                    }
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-color)]"
                  >

                    <Eye size={22} />

                  </button>

                  <button
                    onClick={() =>
                      deletePage(
                        item.id
                      )
                    }
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--danger-color)]"
                  >

                    <Trash2 size={22} />

                  </button>

                </div>

              </div>

            </div>

          )
        )}

      </div>

      {/* PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] p-6">

        <h2 className="text-3xl font-black">
          Dynamic Pages System
        </h2>

        <p className="mt-2 text-[var(--button-text-color)]/80">
          Create unlimited custom pages
        </p>

      </div>

    </main>

  );
}
