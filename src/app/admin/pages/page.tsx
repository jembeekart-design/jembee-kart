"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  LayoutTemplate,
  Plus,
  Trash2,
  Eye,
  FileText
} from "lucide-react";

interface PageItem {
  id: number;
  title: string;
  slug: string;
  visible: boolean;
}

export default function PagesManagerPage() {

  const [pages, setPages] =
    useState<PageItem[]>([
      {
        id: 1,
        title: "About Us",
        slug: "/about",
        visible: true
      },
      {
        id: 2,
        title: "Privacy Policy",
        slug: "/privacy-policy",
        visible: true
      }
    ]);

  const [title, setTitle] =
    useState("");

  const [slug, setSlug] =
    useState("");

  function createPage() {

    if (
      !title ||
      !slug
    ) {
      return;
    }

    const newPage = {
      id: Date.now(),
      title,
      slug,
      visible: true
    };

    setPages((prev) => [
      newPage,
      ...prev
    ]);

    setTitle("");
    setSlug("");
  }

  function deletePage(
    id: number
  ) {

    setPages((prev) =>
      prev.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  function togglePage(
    id: number
  ) {

    setPages((prev) =>
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

  return (

    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">

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
              placeholder="/page-slug"
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
                        item.id
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
