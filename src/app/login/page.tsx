"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup, // Redirect ki jagah Popup use karenge
} from "firebase/auth";

import { useRouter } from "next/navigation";
import { auth } from "@/firebase/config";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* ======================================================
  EMAIL & PASSWORD LOGIN
  ====================================================== */
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Sweet alert ya custom toast lagana behtar hai, abhi ke liye reload-safe redirection:
      window.location.href = "/"; 
    } catch (error: any) {
      console.error("Email Login Error:", error);
      alert(error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  /* ======================================================
  GOOGLE LOGIN (FIXED WITH POPUP)
  ====================================================== */
  async function handleGoogleLogin() {
    if (loading) return;

    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      // Redirect triggers page reloads which breaks state, popup works flawlessly
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        window.location.href = "/";
      }
    } catch (error: any) {
      console.error("Google Login Error:", error);
      alert(error.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">

        <h1 className="text-3xl font-bold text-center mb-2 text-black">
          JembeeKart Login
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Login Or Create Account
        </p>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border text-black rounded-lg p-3 outline-none focus:border-blue-500"
            required
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border text-black rounded-lg p-3 outline-none focus:border-blue-500"
            required
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white p-3 rounded-lg font-bold disabled:bg-gray-400"
          >
            {loading ? "Please Wait..." : "Login"}
          </button>
        </form>

        <div className="text-center my-5 text-gray-400 font-bold">
          OR
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 transition-colors text-white p-3 rounded-lg font-bold disabled:bg-gray-400"
        >
          {loading ? "Please Wait..." : "Continue With Google"}
        </button>
      </div>
    </main>
  );
}
