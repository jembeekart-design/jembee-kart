// src/shared/security/csrf.ts

import crypto from "crypto";

export const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const validateCSRF = (token: string, stored: string) => {
  return token === stored;
};