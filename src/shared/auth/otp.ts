// src/shared/auth/otp.ts

import {
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";

const auth = getAuth();

export const sendOTP = async (phone: string) => {
  const recaptcha = new RecaptchaVerifier(auth, "recaptcha", {});
  return await signInWithPhoneNumber(auth, phone, recaptcha);
};

export const verifyOTP = async (confirmation: any, code: string) => {
  return await confirmation.confirm(code);
};