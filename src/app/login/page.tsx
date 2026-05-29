"use client";

import { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";
import { auth } from "@/firebase/config";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // 1. Email/Password Login Function
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      alert(`Welcome back! ${userCredential.user.email}`);
      // Yahan redirect logic add karein (e.g., router.push('/dashboard'))
    } catch (error: any) {
      console.error("Email Login Error:", error);
      alert(error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  // 2. Google Login Function
  async function handleGoogleLogin() {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      alert(`Welcome ${result.user.displayName || "User"}!`);
      // Yahan redirect logic add karein
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      alert(error.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign In to Account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Enter your credentials or continue with Google
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-md sm:rounded-xl sm:px-10 border border-slate-100 space-y-6">
          
          {/* Email & Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-60"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-60"
                required
              />
            </div>

            {/* Forgot Password Link (Optional) */}
            <div className="flex items-center justify-end">
              <button 
                type="button"
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Signing in..." : "Sign In with Email"}
            </button>
          </form>

          {/* Divider "Or continue with" */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google Login Button */}
          <div>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              type="button"
              className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {/* Google SVG Icon */}
              <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
