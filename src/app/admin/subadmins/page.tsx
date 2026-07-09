"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Shield,
  Plus,
  Trash2,
  Mail,
  User,
  Lock
} from "lucide-react";

interface AdminItem {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function SubAdminsPage() {

  const [admins, setAdmins] =
    useState<AdminItem[]>([
      {
        id: 1,
        name: "Rahul Admin",
        email: "rahul@jembeekart.com",
        role: "Manager"
      },
      {
        id: 2,
        name: "Aman Support",
        email: "aman@jembeekart.com",
        role: "Support"
      }
    ]);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [role, setRole] =
    useState("");

  function addAdmin() {

    if (
      !name ||
      !email ||
      !role
    ) {
      return;
    }

    const newAdmin = {
      id: Date.now(),
      name,
      email,
      role
    };

    setAdmins((prev) => [
      newAdmin,
      ...prev
    ]);

    setName("");
    setEmail("");
    setRole("");
  }

  function deleteAdmin(
    id: number
  ) {

    setAdmins((prev) =>
      prev.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-violet-600">

          <Shield size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Sub Admins
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Manage admin access & roles
          </p>

        </div>

      </div>

      {/* CREATE ADMIN */}

      <div className="rounded-[30px] bg-[#151515] p-5">

        <h2 className="text-2xl font-black">
          Add New Admin
        </h2>

        <div className="mt-5 space-y-4">

          <div className="flex items-center gap-3 rounded-2xl bg-[var(--card-color)] px-4 py-4">

            <User
              size={20}
              className="text-[var(--muted-text-color)]"
            />

            <input
              type="text"
              placeholder="Admin Name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              className="w-full bg-transparent outline-none"
            />

          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[var(--card-color)] px-4 py-4">

            <Mail
              size={20}
              className="text-[var(--muted-text-color)]"
            />

            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              className="w-full bg-transparent outline-none"
            />

          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[var(--card-color)] px-4 py-4">

            <Lock
              size={20}
              className="text-[var(--muted-text-color)]"
            />

            <input
              type="text"
              placeholder="Admin Role"
              value={role}
              onChange={(e) =>
                setRole(
                  e.target.value
                )
              }
              className="w-full bg-transparent outline-none"
            />

          </div>

          <button
            onClick={addAdmin}
            className="flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 font-bold"
          >

            <Plus size={18} />

            Add Admin

          </button>

        </div>

      </div>

      {/* ADMIN LIST */}

      <div className="mt-6 space-y-5">

        {admins.map(
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

                  <p className="mt-2 text-sm text-[var(--muted-text-color)] break-all">
                    {item.email}
                  </p>

                  <div className="mt-4 inline-block rounded-full bg-violet-600 px-4 py-2 text-sm font-bold">

                    {item.role}

                  </div>

                </div>

                <button
                  onClick={() =>
                    deleteAdmin(
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

      {/* PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-violet-600 to-fuchsia-500 p-6">

        <h2 className="text-3xl font-black">
          Admin Access System
        </h2>

        <p className="mt-2 text-[var(--button-text-color)]/80">
          Manage multiple admin roles securely
        </p>

      </div>

    </main>

  );
}
