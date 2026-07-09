"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  HardDrive,
  Image,
  FileText,
  Trash2,
  Upload,
  Folder,
  CheckCircle
} from "lucide-react";

interface StorageItem {
  id: number;
  name: string;
  type: string;
  size: string;
}

export default function StoragePage() {

  const [files, setFiles] =
    useState<StorageItem[]>([
      {
        id: 1,
        name: "banner-image.png",
        type: "Image",
        size: "2.4 MB"
      },
      {
        id: 2,
        name: "invoice.pdf",
        type: "Document",
        size: "1.1 MB"
      },
      {
        id: 3,
        name: "product-photo.jpg",
        type: "Image",
        size: "3.2 MB"
      }
    ]);

  function uploadFile() {

    alert(
      "File Upload Started"
    );
  }

  function deleteFile(
    id: number
  ) {

    setFiles((prev) =>
      prev.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-pink-500">

            <HardDrive size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Storage Manager
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage uploaded files & media
            </p>

          </div>

        </div>

        <button
          onClick={uploadFile}
          className="flex items-center gap-2 rounded-2xl bg-pink-500 px-5 py-3 text-sm font-bold"
        >

          <Upload size={18} />

          Upload File

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-3 gap-4">

        <div className="rounded-[30px] bg-[#151515] p-5">

          <Folder
            size={28}
            className="text-cyan-400"
          />

          <p className="mt-4 text-sm text-gray-400">
            Total Files
          </p>

          <h2 className="mt-2 text-3xl font-black">
            {files.length}
          </h2>

        </div>

        <div className="rounded-[30px] bg-[#151515] p-5">

          <HardDrive
            size={28}
            className="text-green-400"
          />

          <p className="mt-4 text-sm text-gray-400">
            Storage Used
          </p>

          <h2 className="mt-2 text-3xl font-black">
            5.7 GB
          </h2>

        </div>

        <div className="rounded-[30px] bg-[#151515] p-5">

          <CheckCircle
            size={28}
            className="text-yellow-400"
          />

          <p className="mt-4 text-sm text-gray-400">
            Status
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Healthy
          </h2>

        </div>

      </div>

      {/* FILE LIST */}

      <div className="mt-6 space-y-5">

        {files.map(
          (item) => (

            <div
              key={item.id}
              className="rounded-[30px] bg-[#151515] p-5"
            >

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black">

                    {item.type ===
                    "Image" ? (

                      <Image
                        size={24}
                        className="text-cyan-400"
                      />

                    ) : (

                      <FileText
                        size={24}
                        className="text-yellow-400"
                      />

                    )}

                  </div>

                  <div>

                    <h2 className="text-xl font-black break-all">
                      {item.name}
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      {item.type}
                      {" • "}
                      {item.size}
                    </p>

                  </div>

                </div>

                <button
                  onClick={() =>
                    deleteFile(
                      item.id
                    )
                  }
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--danger-color)]"
                >

                  <Trash2 size={22} />

                </button>

              </div>

            </div>

          )
        )}

      </div>

      {/* FOOTER */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-pink-500 to-fuchsia-500 p-6">

        <h2 className="text-3xl font-black">
          Media Storage System
        </h2>

        <p className="mt-2 text-[var(--button-text-color)]/80">
          Upload & manage all website media files
        </p>

      </div>

    </main>
  );
}
