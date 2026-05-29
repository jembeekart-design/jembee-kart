"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect
} from "firebase/auth";

import { useRouter } from "next/navigation";

import { auth } from "@/firebase/config";

export default function LoginPage() {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const router = useRouter();

  /* ======================================================
  EMAIL LOGIN
  ====================================================== */

  async function handleEmailLogin(
    e: React.FormEvent
  ) {

    e.preventDefault();

    if (!email || !password) {

      alert(
        "Please fill all fields"
      );

      return;
    }

    try {

      setLoading(true);

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      alert(
        `Welcome ${userCredential.user.email}`
      );

      router.push("/");

    } catch (error: any) {

      console.error(error);

      alert(
        error.message
      );

    } finally {

      setLoading(false);

    }
  }

  /* ======================================================
  GOOGLE LOGIN
  ====================================================== */

  async function handleGoogleLogin() {

    try {

      setLoading(true);

      const provider =
        new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account"
      });

      await signInWithRedirect(
        auth,
        provider
      );

    } catch (error: any) {

      console.error(
        "Google Login Error:",
        error
      );

      alert(
        error.message ||
        "Google Login Failed"
      );

      setLoading(false);
    }
  }

  return (
    <div>
      {/* Existing UI */}
    </div>
  );
}
