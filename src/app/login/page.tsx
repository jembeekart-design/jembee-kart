"use client";

import { useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  ConfirmationResult
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const [phone, setPhone] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [confirm, setConfirm] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 1. Phone Auth: Send OTP
  async function sendOTP() {
    if (!phone) return alert("Please enter a phone number");
    setLoading(true);
    try {
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible", // Invisible recaptcha user experience ke liye best hai
      });

      const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirm(confirmation);
      alert("OTP sent successfully!");
    } catch (error: any) {
      console.error("Phone Auth Error:", error);
      alert(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  // 2. Phone Auth: Verify OTP
  async function verifyOTP() {
    if (!otp) return alert("Please enter the OTP");
    if (!confirm) return alert("Please request an OTP first");
    
    setLoading(true);
    try {
      await confirm.confirm(otp);
      alert("Login successful!");
    } catch (error: any) {
      console.error("OTP Verification Error:", error);
      alert("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // 3. Google Login
  async function loginWithGoogle() {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // User info access karne ke liye: const user = result.user;
      alert(`Welcome ${result.user.displayName}!`);
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      alert(error.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6">
          
          {/* Invisible Recaptcha Container */}
          <div id="recaptcha-container" />

          {/* Phone Number Input & Button */}
          {!confirm ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="+91XXXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button
                  onClick={sendOTP}
                  disabled={loading}
                  className="w-32 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            </div>
          ) : (
            /* OTP Input & Button (Sirf tabhi dikhega jab OTP send ho chuka ho) */
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Enter Verification Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
                <button
                  onClick={verifyOTP}
                  disabled={loading}
                  className="w-32 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
              <button 
                onClick={() => setConfirm(null)} 
                className="text-xs text-indigo-600 hover:underline mt-1"
              >
                Change Phone Number
              </button>
            </div>
          )}

          {/* Divider Line */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Login Button */}
          <div>
            <button
              onClick={loginWithGoogle}
              disabled={loading}
              className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {/* Google Icon SVG */}
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
