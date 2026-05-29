"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged
} from "firebase/auth";

import { auth } from "@/firebase/config";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          router.replace("/");
        }
      })
      .catch(console.error);

    const unsubscribe =
      onAuthStateChanged(auth, (user) => {

        if (user) {
          router.replace("/");
        }

      });

    return () => unsubscribe();

  }, [router]);

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

      router.replace("/");

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

      router.replace("/");

    } catch (error: any) {

      alert(error.message);

    } finally {

      setLoading(false);

    }
  }

  async function googleLogin() {

    try {

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

      alert(error.message);

    }
  }

  async function forgotPassword() {

    if (!email) {

      alert("Enter email first");

      return;
    }

    try {

      await sendPasswordResetEmail(
        auth,
        email
      );

      alert(
        "Password reset email sent"
      );

    } catch (error: any) {

      alert(error.message);
    }
  }

  return (
    <div>
      {/* Yahan tumhara existing UI rahega */}
    </div>
  );
}
