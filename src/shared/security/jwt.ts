// src/shared/security/jwt.ts

import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret";

// 🔹 Generate Token
export const signToken = (payload: any) => {
  return jwt.sign(payload, SECRET, {
    expiresIn: "7d",
  });
};

// 🔹 Verify Token
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
};