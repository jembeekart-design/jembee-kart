"use client";

import { useState } from "react";

import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";

import { auth } from "@/lib/firebase";

export default function LoginPage() {

  const [phone, setPhone] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [confirm, setConfirm] =
    useState<any>(null);

  async function sendOTP() {

    try {

      const verifier =
        new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {}
        );

      const confirmation =
        await signInWithPhoneNumber(
          auth,
          phone,
          verifier
        );

      setConfirm(
        confirmation
      );

      alert(
        "OTP Sent"
      );

    } catch (error) {

      console.error(error);

    }

  }

  async function verifyOTP() {

    try {

      await confirm.confirm(
        otp
      );

      alert(
        "Login Success"
      );

    } catch (error) {

      console.error(error);

    }

  }

  return (

    <main className="p-6">

      <div id="recaptcha-container" />

      <input
        type="text"
        placeholder="+91XXXXXXXXXX"
        value={phone}
        onChange={(e) =>
          setPhone(e.target.value)
        }
        className="border p-3"
      />

      <button
        onClick={sendOTP}
        className="bg-black p-3 text-white"
      >

        Send OTP

      </button>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) =>
          setOtp(e.target.value)
        }
        className="border p-3"
      />

      <button
        onClick={verifyOTP}
        className="bg-green-600 p-3 text-white"
      >

        Verify OTP

      </button>

    </main>

  );

}
