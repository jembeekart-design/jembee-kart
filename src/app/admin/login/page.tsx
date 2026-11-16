"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "@/firebase/config";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("error");
    if (reason === "not-admin") {
      setError("Admin session verify नहीं हुआ। कृपया Admin account से दोबारा login करें।");
    }
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdToken(true);
      const adminResponse = await fetch("/api/auth/admin-check", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const adminResult = await adminResponse.json().catch(() => null);

      if (adminResponse.status === 401 || adminResponse.status === 403 || adminResult?.isAdmin !== true) {
        await auth.signOut();
        setError("यह account Admin के रूप में अधिकृत नहीं है। सही Admin account से login करें।");
        return;
      }
      if (!adminResponse.ok) {
        setError("Admin verification अभी उपलब्ध नहीं है। कृपया दोबारा कोशिश करें।");
        return;
      }

      const requestedNext = new URLSearchParams(window.location.search).get("next") || "";
      // Preserve only the fixed same-origin ChatGPT consent route.
      if (requestedNext.startsWith("/connect/chatgpt/") || requestedNext === "/connect/chatgpt") {
        router.replace(requestedNext);
      } else {
        router.replace("/admin");
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--card-color)] p-5">

      <form
        onSubmit={login}
        className="w-full max-w-md bg-[var(--card-color)] rounded-xl p-6 border border-[var(--border-color)]"
      >

        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-6 text-center">
          JEMBEE PLAY Admin Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 rounded bg-[var(--card-color)] text-[var(--text-primary)] outline-none"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 rounded bg-[var(--card-color)] text-[var(--text-primary)] outline-none"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        {error && (
          <div className="text-[var(--color-danger)] mb-4">
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
