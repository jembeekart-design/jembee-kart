"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
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
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/"; 
    } catch (error: any) {
      console.error("Email Login Error:", error);
      alert(error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  /* ======================================================
  GOOGLE LOGIN
  ====================================================== */
  async function handleGoogleLogin() {
    if (loading) return;

    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

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
    <main className="min-h-screen flex items-center justify-center bg-[#f6f7fb] p-4 sm:p-6 lg:p-8 selection:bg-indigo-500 selection:text-white">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-gray-100 p-8 md:p-10 z-10 transition-all duration-300 hover:shadow-indigo-100">
        
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white text-3xl shadow-md mb-4 animate-bounce">
            🛍️
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            JembeeKart
          </h1>
          <p className="text-sm font-medium text-gray-400 mt-2">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-100 text-sm font-semibold text-gray-900 rounded-2xl px-4 py-3.5 outline-none transition-all focus:border-indigo-500 bg-gray-50/50 focus:bg-white disabled:opacity-50"
              required
              disabled={loading}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-500">
                Password
              </label>
              <a href="#" className="text-xs font-bold text-indigo-600 hover:underline">
                Forgot?
              </a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-gray-100 text-sm font-semibold text-gray-900 rounded-2xl px-4 py-3.5 outline-none transition-all focus:border-indigo-500 bg-gray-50/50 focus:bg-white disabled:opacity-50"
              required
              disabled={loading}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm p-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying Account...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-6 items-center">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink mx-4 text-xs font-black uppercase tracking-widest text-gray-400">
            Or continue with
          </span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all text-gray-700 font-bold p-4 rounded-2xl active:scale-[0.98] disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.256-3.133C18.344 1.104 15.528 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.854 11.57-11.77 0-.795-.085-1.4-.195-1.945H12.24z"
            />
          </svg>
          Google Account
        </button>

        {/* Footer info */}
        <p className="text-center text-xs font-semibold text-gray-400 mt-8">
          Don't have an account?{" "}
          <a href="#" className="text-indigo-600 font-bold hover:underline">
            Sign up for free
          </a>
        </p>
      </div>
    </main>
  );
}
