"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase/config";
import toast, { Toaster } from "react-hot-toast";

import {
  Image,
  Video,
  FileText,
  Upload,
  Search,
  Trash2,
  Download,
  Folder,
  HardDrive,
  Eye,
  Grid3X3,
  Loader2
} from "lucide-react";

export default function MediaLibraryPage() {
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      const q = query(collection(db, "watchEarnVideos"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().title || "Untitled Video",
        type: "Video",
        size: "N/A",
        publicId: doc.data().publicId,
      }));
      setFiles(data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (file: any) => {
    if (!confirm("Are you sure you want to permanently delete this video?")) return;

    setDeletingId(file.id);
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      const response = await fetch("/api/admin/delete-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: file.id, publicId: file.publicId, token }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Video deleted successfully.");
        setFiles((prev) => prev.filter((f) => f.id !== file.id));
      } else {
        throw new Error(result.message || "Failed to delete video");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredFiles = files.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">
      <Toaster />

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-[var(--primary-color)]">

            <Folder
              size={30}
              className="text-[var(--text-color)]"
            />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Media Library
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Manage images, videos & documents
            </p>

          </div>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-[var(--primary-color)] px-5 py-3 font-bold text-[var(--text-color)]">

          <Upload size={18} />

          Upload File

        </button>

      </div>

      {/* SEARCH */}

      <div className="flex items-center gap-3 rounded-[24px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] px-4 py-3">

        <Search
          size={20}
          className="text-[var(--muted-text-color)]"
        />

        <input
          type="text"
          placeholder="Search media..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="w-full bg-transparent outline-none placeholder:text-[var(--muted-text-color)]"
        />

      </div>

      {/* STATS */}

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Images"
          value="1.2K"
          icon={<Image size={22} />}
        />

        <StatCard
          title="Videos"
          value="320"
          icon={<Video size={22} />}
        />

        <StatCard
          title="Documents"
          value="840"
          icon={<FileText size={22} />}
        />

        <StatCard
          title="Storage"
          value="42GB"
          icon={<HardDrive size={22} />}
        />

      </div>

      {/* FILE GRID */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

        {loading ? (
          <p className="p-5">Loading...</p>
        ) : filteredFiles.map(
          (
            item,
            index
          ) => (

            <div
              key={item.id}
              className="overflow-hidden rounded-[28px] border border-[var(--border-color)]/10 bg-[var(--primary-color)]"
            >

              {/* PREVIEW */}

              <div className="flex h-40 items-center justify-center bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-color)]">

                <Video
                  size={52}
                  className="text-[var(--text-color)]"
                />

              </div>

              {/* CONTENT */}

              <div className="p-5">

                <h2 className="truncate text-xl font-black">
                  {item.name}
                </h2>

                <div className="mt-2 flex items-center justify-between text-sm text-[var(--muted-text-color)]">

                  <span>
                    {item.type}
                  </span>

                  <span>
                    {item.size}
                  </span>

                </div>

                {/* ACTIONS */}

                <div className="mt-5 flex items-center justify-between">

                  <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--card-color)]/10">

                    <Eye size={18} />

                  </button>

                  <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--card-color)]/10">

                    <Download size={18} />

                  </button>

                  <button 
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item.id}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--danger-color)]/20 text-[var(--danger-color)] disabled:opacity-50">

                    {deletingId === item.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}

                  </button>

                </div>

              </div>

            </div>

          )
        )}

      </div>

      {/* LIBRARY SECTION */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] p-6">

        <div className="flex items-center gap-3">

          <Grid3X3 size={26} />

          <h2 className="text-3xl font-black">
            Smart Media System
          </h2>

        </div>

        <p className="mt-3 max-w-2xl text-sm text-[var(--button-text-color)]/90">

          Organize files with AI powered media tagging,
          cloud sync and realtime optimization.

        </p>

        <button className="mt-6 rounded-2xl bg-[var(--card-color)] px-6 py-3 font-bold text-[var(--button-text-color)]">

          Open Media Manager

        </button>

      </div>

    </main>

  );
}

function StatCard({
  title,
  value,
  icon
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {

  return (

    <div className="rounded-[28px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-5">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-color)] text-[var(--text-color)]">

        {icon}

      </div>

      <p className="mt-4 text-sm text-[var(--muted-text-color)]">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-black">
        {value}
      </h2>

    </div>

  );
}
