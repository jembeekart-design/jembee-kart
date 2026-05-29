"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
} from "firebase/auth";

import { useRouter } from "next/navigation";
import { auth } from "@/firebase/config";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      const result =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      alert(
        `Welcome ${result.user.email}`
      );

      router.push("/");
    } catch (error: any) {
      alert(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setLoading(true);

      const provider =
        new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      await signInWithRedirect(
        auth,
        provider
      );
    } catch (error: any) {
      alert(error.message);
      console.error(error);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">

        <h1 className="text-3xl font-bold text-center mb-2">
          JembeeKart Login
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Login Or Create Account
        </p>

        <form
          onSubmit={handleEmailLogin}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full border rounded-lg p-3"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border rounded-lg p-3"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg"
          >
            {loading
              ? "Please Wait..."
              : "Login"}
          </button>
        </form>

        <div className="text-center my-5">
          OR
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-red-600 text-white p-3 rounded-lg"
        >
          Continue With Google
        </button>
      </div>
    </main>
  );
}
