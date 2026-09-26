"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  FileText,
  Plus,
  Trash2,
  PenSquare,
  Eye,
} from "lucide-react";

import { db } from "@/firebase/config";

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  author: string;
  published: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("JembeeKart");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "blogs"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as BlogItem[];

        setBlogs(data);
        setLoading(false);
      },
      (error) => {
        console.error("Blog Firestore error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  async function addBlog() {
    if (
      !title.trim() ||
      !description.trim() ||
      !content.trim()
    ) {
      alert("Please fill title, description and content.");
      return;
    }

    try {
      setAdding(true);

      const slug = createSlug(title);

      await addDoc(collection(db, "blogs"), {
        title: title.trim(),
        slug,
        description: description.trim(),
        content: content.trim(),
        author: author.trim() || "JembeeKart",
        published: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setTitle("");
      setDescription("");
      setContent("");

      alert("Blog published successfully.");
    } catch (error) {
      console.error("Failed to add blog:", error);
      alert("Failed to publish blog.");
    } finally {
      setAdding(false);
    }
  }

  async function toggleBlog(
    id: string,
    published: boolean
  ) {
    try {
      await updateDoc(doc(db, "blogs", id), {
        published: !published,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to update blog:", error);
    }
  }

  async function deleteBlog(id: string) {
    if (!confirm("Delete this blog?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "blogs", id));
    } catch (error) {
      console.error("Failed to delete blog:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--card-color)] text-[var(--button-text-color)]">
        Loading Blogs...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] p-4 text-[var(--button-text-color)]">

      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--warning-color)]">
          <FileText size={30} />
        </div>

        <div>
          <h1 className="text-3xl font-black">
            Blogs Manager
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Manage website blogs & articles
          </p>
        </div>
      </div>

      <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

        <h2 className="text-2xl font-black">
          Create Blog
        </h2>

        <div className="mt-5 space-y-4">

          <div className="flex items-center gap-3 rounded-2xl bg-[var(--card-color)] px-4 py-4">
            <PenSquare
              size={20}
              className="text-[var(--muted-text-color)]"
            />

            <input
              type="text"
              placeholder="Blog Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>

          <input
            type="text"
            placeholder="Short Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-2xl bg-[var(--card-color)] px-4 py-4 outline-none"
          />

          <input
            type="text"
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full rounded-2xl bg-[var(--card-color)] px-4 py-4 outline-none"
          />

          <textarea
            placeholder="Full Blog Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[240px] w-full rounded-2xl bg-[var(--card-color)] px-4 py-4 outline-none"
          />

          <button
            onClick={addBlog}
            disabled={adding}
            className="flex items-center gap-2 rounded-2xl bg-[var(--warning-color)] px-5 py-3 font-bold disabled:opacity-50"
          >
            <Plus size={18} />

            {adding ? "Publishing..." : "Publish Blog"}
          </button>

        </div>
      </div>

      <div className="mt-6 space-y-5">

        {blogs.length === 0 ? (
          <div className="rounded-[30px] bg-[var(--primary-color)] p-6">
            No blogs published yet.
          </div>
        ) : (
          blogs.map((item) => (
            <div
              key={item.id}
              className="rounded-[30px] bg-[var(--primary-color)] p-5"
            >
              <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">

                  <h2 className="text-2xl font-black">
                    {item.title}
                  </h2>

                  <p className="mt-3 text-sm text-[var(--muted-text-color)]">
                    {item.description}
                  </p>

                  <p className="mt-2 text-xs opacity-60">
                    /blog/{item.slug}
                  </p>

                  <div className="mt-4 inline-block rounded-full bg-[var(--warning-color)] px-4 py-2 text-sm font-bold">
                    {item.published ? "Published" : "Hidden"}
                  </div>

                </div>

                <div className="flex shrink-0 gap-3">

                  <button
                    onClick={() =>
                      toggleBlog(item.id, item.published)
                    }
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-color)]"
                    aria-label="Toggle blog visibility"
                  >
                    <Eye size={22} />
                  </button>

                  <button
                    onClick={() => deleteBlog(item.id)}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--danger-color)]"
                    aria-label="Delete blog"
                  >
                    <Trash2 size={22} />
                  </button>

                </div>
              </div>
            </div>
          ))
        )}

      </div>

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] p-6">

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
