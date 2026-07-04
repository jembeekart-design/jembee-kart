"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";

import {
  Flame,
  Database,
  Plus,
  Trash2,
  RefreshCcw,
  CheckCircle,
  FileJson,
  Layers3
} from "lucide-react";

interface FirestoreCollection {
  id: number;
  name: string;
  documents: number;
}

export default function FirestorePage() {
  const router = useRouter();

  const [
    collections,
    setCollections
  ] = useState<FirestoreCollection[]>([
    {
      id: 1,
      name: "users",
      documents: 1240
    },
    {
      id: 2,
      name: "products",
      documents: 532
    },
    {
      id: 3,
      name: "orders",
      documents: 881
    },
    {
      id: 4,
      name: "affiliate_users",
      documents: 93
    }
  ]);

  const [
    collectionName,
    setCollectionName
  ] = useState("");
  useEffect(() => {
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.replace("/login");
    }
  });

  return () => {
    unsubscribeAuth();
  };
}, [router]);

  function createCollection() {

    if (!collectionName) {
      return;
    }

    const newCollection = {
      id: Date.now(),
      name: collectionName,
      documents: 0
    };

    setCollections((prev) => [
      newCollection,
      ...prev
    ]);

    setCollectionName("");

    alert(
      "Collection Created"
    );
  }

  function deleteCollection(
    id: number
  ) {

    setCollections((prev) =>
      prev.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  function refreshFirestore() {

    alert(
      "Firestore Synced"
    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-orange-500">

            <Flame size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Firestore Manager
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage Firebase Firestore collections
            </p>

          </div>

        </div>

        <button
          onClick={refreshFirestore}
          className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold"
        >

          <RefreshCcw size={18} />

          Sync Firestore

        </button>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-3 gap-4">

        <div className="rounded-[30px] bg-[#151515] p-5">

          <Database
            size={28}
            className="text-cyan-400"
          />

          <p className="mt-4 text-sm text-gray-400">
            Collections
          </p>

          <h2 className="mt-2 text-3xl font-black">
            {collections.length}
          </h2>

        </div>

        <div className="rounded-[30px] bg-[#151515] p-5">

          <Layers3
            size={28}
            className="text-violet-400"
          />

          <p className="mt-4 text-sm text-gray-400">
            Total Documents
          </p>

          <h2 className="mt-2 text-3xl font-black">
            2746
          </h2>

        </div>

        <div className="rounded-[30px] bg-[#151515] p-5">

          <CheckCircle
            size={28}
            className="text-green-400"
          />

          <p className="mt-4 text-sm text-gray-400">
            Firestore Status
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Active
          </h2>

        </div>

      </div>

      {/* CREATE COLLECTION */}

      <div className="mt-6 rounded-[30px] bg-[#151515] p-5">

        <h2 className="text-2xl font-black">
          Create Collection
        </h2>

        <div className="mt-5 flex gap-4">

          <div className="flex flex-1 items-center gap-3 rounded-2xl bg-black px-4 py-4">

            <FileJson
              size={20}
              className="text-gray-400"
            />

            <input
              type="text"
              placeholder="Collection Name"
              value={collectionName}
              onChange={(e) =>
                setCollectionName(
                  e.target.value
                )
              }
              className="w-full bg-transparent outline-none"
            />

          </div>

          <button
            onClick={createCollection}
            className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-bold"
          >

            <Plus size={18} />

            Create

          </button>

        </div>

      </div>

      {/* COLLECTION LIST */}

      <div className="mt-6 space-y-5">

        {collections.map(
          (item) => (

            <div
              key={item.id}
              className="rounded-[30px] bg-[#151515] p-5"
            >

              <div className="flex items-center justify-between gap-4">

                <div>

                  <h2 className="text-2xl font-black">
                    {item.name}
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    Documents:
                    {" "}
                    {item.documents}
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-bold">

                    <CheckCircle size={16} />

                    Active

                  </div>

                </div>

                <button
                  onClick={() =>
                    deleteCollection(
                      item.id
                    )
                  }
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500"
                >

                  <Trash2 size={22} />

                </button>

              </div>

            </div>

          )
        )}

      </div>

      {/* FOOTER */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-orange-500 to-red-500 p-6">

        <h2 className="text-3xl font-black">
          Firebase Firestore
        </h2>

        <p className="mt-2 text-white/80">
          Real-time database management system
        </p>

      </div>

    </main>
  );
}
