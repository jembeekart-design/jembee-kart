'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [themeColor, setThemeColor] = useState("#6366f1");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email & password");
      return;
    }

    try {
      setLoading(true);

      await loginAdmin(email, password);

      router.push("/admin");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
      <div className="glass p-8 rounded-2xl w-full max-w-md space-y-5">
        {/* Title */}
        <h1 className="text-2xl font-bold text-center">
          🔐 Admin Login
        </h1>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none"
        />

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl font-medium"
          style={{
            background: themeColor,
            boxShadow: `0 0 20px ${themeColor}55`,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Info */}
        <p className="text-xs text-center opacity-60">
          Use your Firebase admin account
        </p>
      </div>
    </div>
  );
}
