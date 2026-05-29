"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithRedirect
} from "firebase/auth";

import { auth } from "@/firebase/config";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function loginUser(
    e: React.FormEvent
  ) {

    e.preventDefault();

    try {

      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Login Successful");

      router.push("/");

    } catch (error: any) {

      alert(error.message);

    } finally {

      setLoading(false);

    }
  }

  async function signupUser() {

    try {

      setLoading(true);

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Account Created");

      router.push("/");

    } catch (error: any) {

      alert(error.message);

    } finally {

      setLoading(false);

    }
  }

  async function googleLogin() {

    try {

      setLoading(true);

      const provider =
        new GoogleAuthProvider();

      await signInWithRedirect(
        auth,
        provider
      );

    } catch (error: any) {

      alert(error.message);

      setLoading(false);
    }
  }

  async function forgotPassword() {

    if (!email) {

      alert(
        "Enter Email First"
      );

      return;
    }

    try {

      await sendPasswordResetEmail(
        auth,
        email
      );

      alert(
        "Password Reset Email Sent"
      );

    } catch (error: any) {

      alert(error.message);
    }
  }

  return (

    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">

        <h1 className="text-3xl font-bold text-center mb-2">
          JembeeKart Login
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Login Or Create Account
        </p>

        <form
          onSubmit={loginUser}
          className="space-y-4"
        >

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full border p-3 rounded-lg"
          />

          <div className="relative">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded-lg"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              className="absolute right-3 top-3"
            >
              {showPassword
                ? "🙈"
                : "👁️"}
            </button>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg"
          >
            {
              loading
                ? "Loading..."
                : "Login"
            }
          </button>

        </form>

        <button
          onClick={signupUser}
          className="w-full mt-3 bg-green-600 text-white p-3 rounded-lg"
        >
          Create Account
        </button>

        <button
          onClick={forgotPassword}
          className="w-full mt-3 text-blue-600"
        >
          Forgot Password?
        </button>

        <div className="my-6 text-center text-gray-500">
          OR
        </div>

        <button
          onClick={googleLogin}
          className="w-full bg-red-500 text-white p-3 rounded-lg"
        >
          Continue With Google
        </button>

      </div>

    </main>
  );
}
