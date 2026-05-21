"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc
} from "firebase/firestore";

import {
  Trash2,
  Eye,
  EyeOff,
  User
} from "lucide-react";

import { db } from "@/firebase/config";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  visible: boolean;
  profileImage: string;
}

export default function UsersPage() {

  const [users, setUsers] =
    useState<UserItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchUsers();

  }, []);

  async function fetchUsers() {

    try {

      const snapshot =
        await getDocs(
          collection(
            db,
            "users"
          )
        );

      const data =
        snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data()
          })
        ) as UserItem[];

      setUsers(data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  }

  async function updateUser(
    id: string,
    field: string,
    value: any
  ) {

    try {

      const ref = doc(
        db,
        "users",
        id
      );

      await updateDoc(ref, {
        [field]: value
      });

      setUsers((prev) =>
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

  async function deleteUser(
    id: string
  ) {

    try {

      await deleteDoc(
        doc(
          db,
          "users",
          id
        )
      );

      setUsers((prev) =>
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
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-6">

        <h1 className="text-3xl font-black">
          Users Manager
        </h1>

        <p className="mt-1 text-sm text-gray-400">
          Manage all users
        </p>

      </div>

      {/* USERS */}

      <div className="space-y-5">

        {users.map(
          (user) => (

            <div
              key={user.id}
              className="overflow-hidden rounded-[30px] border border-white/10 bg-[#151515]"
            >

              {/* TOP */}

              <div className="flex items-center justify-between border-b border-white/10 p-4">

                <div className="flex items-center gap-4">

                  {user.profileImage ? (

                    <img
                      src={
                        user.profileImage
                      }
                      alt={user.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />

                  ) : (

                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-600">

                      <User size={28} />

                    </div>

                  )}

                  <div>

                    <h2 className="text-lg font-black">
                      {user.name}
                    </h2>

                    <p className="text-sm text-gray-400">
                      {user.email}
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-2">

                  <button
                    onClick={() =>
                      updateUser(
                        user.id,
                        "visible",
                        !user.visible
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10"
                  >

                    {user.visible ? (

                      <Eye size={18} />

                    ) : (

                      <EyeOff size={18} />

                    )}

                  </button>

                  <button
                    onClick={() =>
                      deleteUser(
                        user.id
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-500"
                  >

                    <Trash2 size={18} />

                  </button>

                </div>

              </div>

              {/* BODY */}

              <div className="space-y-5 p-4">

                {/* NAME */}

                <div>

                  <p className="mb-2 text-sm font-bold">
                    User Name
                  </p>

                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) =>
                      updateUser(
                        user.id,
                        "name",
                        e.target.value
                      )
                    }
                    className="w-full rounded-2xl border border-white/10 bg-[#1e1e1e] px-4 py-3 text-sm outline-none"
                  />

                </div>

                {/* EMAIL */}

                <div>

                  <p className="mb-2 text-sm font-bold">
                    Email
                  </p>

                  <input
                    type="text"
                    value={user.email}
                    onChange={(e) =>
                      updateUser(
                        user.id,
                        "email",
                        e.target.value
                      )
                    }
                    className="w-full rounded-2xl border border-white/10 bg-[#1e1e1e] px-4 py-3 text-sm outline-none"
                  />

                </div>

                {/* ROLE */}

                <div>

                  <p className="mb-2 text-sm font-bold">
                    Role
                  </p>

                  <input
                    type="text"
                    value={user.role}
                    onChange={(e) =>
                      updateUser(
                        user.id,
                        "role",
                        e.target.value
                      )
                    }
                    className="w-full rounded-2xl border border-white/10 bg-[#1e1e1e] px-4 py-3 text-sm outline-none"
                  />

                </div>

                {/* PROFILE IMAGE */}

                <div>

                  <p className="mb-2 text-sm font-bold">
                    Profile Image
                  </p>

                  <input
                    type="text"
                    value={
                      user.profileImage
                    }
                    onChange={(e) =>
                      updateUser(
                        user.id,
                        "profileImage",
                        e.target.value
                      )
                    }
                    className="w-full rounded-2xl border border-white/10 bg-[#1e1e1e] px-4 py-3 text-sm outline-none"
                  />

                </div>

                {/* LIVE CARD */}

                <div className="rounded-[28px] bg-gradient-to-br from-violet-600 to-fuchsia-600 p-5">

                  <div className="flex items-center gap-4">

                    {user.profileImage ? (

                      <img
                        src={
                          user.profileImage
                        }
                        alt={user.name}
                        className="h-20 w-20 rounded-full object-cover"
                      />

                    ) : (

                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20">

                        <User size={32} />

                      </div>

                    )}

                    <div>

                      <h2 className="text-2xl font-black">
                        {user.name}
                      </h2>

                      <p className="text-sm text-white/80">
                        {user.email}
                      </p>

                      <div className="mt-3 inline-block rounded-full bg-white/20 px-4 py-2 text-xs font-bold">

                        {user.role}

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          )
        )}

      </div>

    </main>

  );
}
