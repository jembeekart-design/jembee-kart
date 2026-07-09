"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  FileText,
  Plus,
  Trash2,
  PenSquare,
  Eye
} from "lucide-react";

interface BlogItem {
  id: number;
  title: string;
  description: string;
  visible: boolean;
}

export default function BlogsPage() {

  const [blogs, setBlogs] =
    useState<BlogItem[]>([
      {
        id: 1,
        title: "Best Fashion Trends",
        description:
          "Top fashion styles for 2026",
        visible: true
      },
      {
        id: 2,
        title: "How To Earn Affiliate Income",
        description:
          "Learn affiliate marketing tips",
        visible: true
      }
    ]);

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription
  ] = useState("");

  function addBlog() {

    if (
      !title ||
      !description
    ) {
      return;
    }

    const newBlog = {
      id: Date.now(),
      title,
      description,
      visible: true
    };

    setBlogs((prev) => [
      newBlog,
      ...prev
    ]);

    setTitle("");
    setDescription("");
  }

  function deleteBlog(
    id: number
  ) {

    setBlogs((prev) =>
      prev.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  function toggleBlog(
    id: number
  ) {

    setBlogs((prev) =>
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

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-orange-500">

          <FileText size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Blogs Manager
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Manage website blogs & articles
          </p>

        </div>

      </div>

      {/* CREATE BLOG */}

      <div className="rounded-[30px] bg-[#151515] p-5">

        <h2 className="text-2xl font-black">
          Create Blog
        </h2>

        <div className="mt-5 space-y-4">

          <div className="flex items-center gap-3 rounded-2xl bg-black px-4 py-4">

            <PenSquare
              size={20}
              className="text-gray-400"
            />

            <input
              type="text"
              placeholder="Blog Title"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              className="w-full bg-transparent outline-none"
            />

          </div>

          <textarea
            placeholder="Blog Description"
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            className="h-32 w-full rounded-2xl bg-black px-4 py-4 outline-none"
          />

          <button
            onClick={addBlog}
            className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-bold"
          >

            <Plus size={18} />

            Publish Blog

          </button>

        </div>

      </div>

      {/* BLOG LIST */}

      <div className="mt-6 space-y-5">

        {blogs.map(
          (item) => (

            <div
              key={item.id}
              className="rounded-[30px] bg-[#151515] p-5"
            >

              <div className="flex items-start justify-between gap-4">

                <div>

                  <h2 className="text-2xl font-black">
                    {item.title}
                  </h2>

                  <p className="mt-3 text-sm text-gray-400">
                    {item.description}
                  </p>

                  <div className="mt-4 inline-block rounded-full bg-orange-500 px-4 py-2 text-sm font-bold">

                    {item.visible
                      ? "Published"
                      : "Hidden"}

                  </div>

                </div>

                <div className="flex gap-3">

                  <button
                    onClick={() =>
                      toggleBlog(
                        item.id
                      )
                    }
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500"
                  >

                    <Eye size={22} />

                  </button>

                  <button
                    onClick={() =>
                      deleteBlog(
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

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-orange-500 to-red-500 p-6">

        <h2 className="text-3xl font-black">
          Blog System
        </h2>

        <p className="mt-2 text-[var(--button-text-color)]/80">
          Publish articles & SEO content
        </p>

      </div>

    </main>

  );
}
