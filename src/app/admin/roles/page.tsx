"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  ShieldCheck,
  Plus,
  Trash2,
  Users,
  Lock
} from "lucide-react";

interface RoleItem {
  id: number;
  role: string;
  users: number;
}

export default function RolesPage() {

  const [roles, setRoles] =
    useState<RoleItem[]>([
      {
        id: 1,
        role: "Super Admin",
        users: 1
      },
      {
        id: 2,
        role: "Support Manager",
        users: 4
      },
      {
        id: 3,
        role: "Order Manager",
        users: 2
      }
    ]);

  const [roleName, setRoleName] =
    useState("");

  function addRole() {

    if (!roleName) {
      return;
    }

    const newRole = {
      id: Date.now(),
      role: roleName,
      users: 0
    };

    setRoles((prev) => [
      newRole,
      ...prev
    ]);

    setRoleName("");
  }

  function deleteRole(
    id: number
  ) {

    setRoles((prev) =>
      prev.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-indigo-600">

          <ShieldCheck size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Roles Manager
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Manage admin roles & permissions
          </p>

        </div>

      </div>

      {/* CREATE ROLE */}

      <div className="rounded-[30px] bg-[#151515] p-5">

        <h2 className="text-2xl font-black">
          Create Role
        </h2>

        <div className="mt-5 flex gap-4">

          <div className="flex flex-1 items-center gap-3 rounded-2xl bg-black px-4 py-4">

            <Lock
              size={20}
              className="text-gray-400"
            />

            <input
              type="text"
              placeholder="Role Name"
              value={roleName}
              onChange={(e) =>
                setRoleName(
                  e.target.value
                )
              }
              className="w-full bg-transparent outline-none"
            />

          </div>

          <button
            onClick={addRole}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-bold"
          >

            <Plus size={18} />

            Add

          </button>

        </div>

      </div>

      {/* ROLE LIST */}

      <div className="mt-6 space-y-5">

        {roles.map(
          (item) => (

            <div
              key={item.id}
              className="rounded-[30px] bg-[#151515] p-5"
            >

              <div className="flex items-center justify-between gap-4">

                <div>

                  <h2 className="text-2xl font-black">
                    {item.role}
                  </h2>

                  <div className="mt-3 flex items-center gap-2 text-gray-400">

                    <Users size={18} />

                    <p className="text-sm">
                      {item.users}
                      {" "}
                      Users Assigned
                    </p>

                  </div>

                </div>

                <button
                  onClick={() =>
                    deleteRole(
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

      {/* PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-indigo-600 to-violet-600 p-6">

        <h2 className="text-3xl font-black">
          Permission System
        </h2>

        <p className="mt-2 text-white/80">
          Manage access levels for admins
        </p>

      </div>

    </main>

  );
}
