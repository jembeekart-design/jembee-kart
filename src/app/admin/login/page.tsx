"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "@/firebase/config";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
   const user = auth.currentUser;

alert(
  `UID: ${user?.uid}\nEMAIL: ${user?.email}`
);

console.log("LOGIN UID:", user?.uid);
console.log("LOGIN EMAIL:", user?.email);
      router.replace("/admin");
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ??
        "Login Failed"
      );
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--card-color)] p-5">

      <form
        onSubmit={login}
        className="w-full max-w-md bg-[var(--card-color)] rounded-xl p-6 border border-[var(--border-color)]"
      >

        <h1 className="text-3xl font-bold text-[var(--button-text-color)] mb-6 text-center">
          Admin Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 rounded bg-[var(--card-color)] text-[var(--button-text-color)] outline-none"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 rounded bg-[var(--card-color)] text-[var(--button-text-color)] outline-none"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        {error && (
          <div className="text-[var(--danger-color)] mb-4">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--primary-color)] hover:bg-[var(--primary-color)] rounded-lg py-3 text-[var(--button-text-color)] font-bold"
        >
          {loading
            ? "Signing In..."
            : "Login"}
        </button>

      </form>

    </div>
  );
}
