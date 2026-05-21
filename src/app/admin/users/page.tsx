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
  User,
  Shield,
  Trash2,
  Crown,
  CheckCircle2
} from "lucide-react";

import { db } from "@/firebase/config";

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  image: string;
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

                <div className="flex items-center gap-3">

                  <img
                    src={
                      user.image ||
                      "https://placehold.co/200/png"
                    }
                    alt={user.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />

                  <div>

                    <h2 className="text-lg font-black">
                      {user.name}
                    </h2>

                    <p className="text-xs text-gray-400">
                      {user.email}
                    </p>

                  </div>

                </div>

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

              {/* BODY */}

              <div className="space-y-4 p-4">

                {/* INFO */}

                <div className="rounded-2xl bg-[#1b1b1b] p-4">

                  <div className="mb-3 flex items-center gap-2">

                    <User size={16} />

                    <p className="text-sm font-bold">
                      User Information
                    </p>

                  </div>

                  <div className="space-y-2 text-sm text-gray-300">

                    <p>
                      Phone:
                      {user.phone}
                    </p>

                    <p>
                      Role:
                      {user.role}
                    </p>

                  </div>

                </div>

                {/* ROLE */}

                <div>

                  <p className="mb-3 text-sm font-bold">
                    User Role
                  </p>

                  <div className="grid grid-cols-3 gap-3">

                    <button
                      onClick={() =>
                        updateUser(
                          user.id,
                          "
