"use client";

import {
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";

import { auth } from "@/lib/firebase";

export default function LoginPage() {

  async function login() {

    try {

      const provider =
        new GoogleAuthProvider();

      await signInWithPopup(
        auth,
        provider
      );

      alert(
        "Login Success"
      );

    } catch (error) {

      console.error(error);

      alert(
        "Login Failed"
      );
    }
  }

  return (

    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#0f172a]
        px-4
      "
    >

      <div
        className="
          w-full
          max-w-sm
          rounded-[32px]
          bg-white
          p-6
          shadow-2xl
        "
      >

        <h1
          className="
            text-center
            text-3xl
            font-black
            text-violet-700
          "
        >

          JembeeKart

        </h1>

        <p
          className="
            mt-2
            text-center
            text-sm
            text-gray-500
          "
        >

          Login to continue

        </p>

        <button
          onClick={login}
          className="
            mt-8
            flex
            w-full
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-r
            from-violet-600
            to-fuchsia-500
            py-4
            text-sm
            font-black
            text-white
          "
        >

          Continue With Google

        </button>

      </div>

    </main>

  );

}
