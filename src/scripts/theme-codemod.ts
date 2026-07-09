import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "src");

const replacements: Record<string, string> = {
  /* =========================
     BACKGROUND
  ========================= */

  "bg-white": "bg-[var(--background-color)]",
  "bg-black": "bg-[var(--card-color)]",
  "bg-gray-50": "bg-[var(--background-color)]",
  "bg-gray-100": "bg-[var(--card-color)]",
  "bg-gray-200": "bg-[var(--card-color)]",
  "bg-gray-300": "bg-[var(--card-color)]",

  "bg-blue-500": "bg-[var(--primary-color)]",
  "bg-blue-600": "bg-[var(--primary-color)]",

  "bg-green-500": "bg-[var(--success-color)]",
  "bg-green-600": "bg-[var(--success-color)]",

  "bg-red-500": "bg-[var(--danger-color)]",
  "bg-red-600": "bg-[var(--danger-color)]",

  "bg-yellow-500": "bg-[var(--warning-color)]",
  "bg-yellow-600": "bg-[var(--warning-color)]",

  /* =========================
     TEXT
  ========================= */

  "text-black": "text-[var(--text-color)]",
  "text-white": "text-[var(--button-text-color)]",

  "text-gray-100": "text-[var(--muted-text-color)]",
  "text-gray-200": "text-[var(--muted-text-color)]",
  "text-gray-300": "text-[var(--muted-text-color)]",
  "text-gray-400": "text-[var(--muted-text-color)]",
  "text-gray-500": "text-[var(--muted-text-color)]",
  "text-gray-600": "text-[var(--muted-text-color)]",
  "text-gray-700": "text-[var(--text-color)]",
  "text-gray-800": "text-[var(--text-color)]",
  "text-gray-900": "text-[var(--text-color)]",

  "text-blue-500": "text-[var(--primary-color)]",
  "text-blue-600": "text-[var(--primary-color)]",

  "text-green-400": "text-[var(--success-color)]",
  "text-green-500": "text-[var(--success-color)]",
  "text-green-600": "text-[var(--success-color)]",

  "text-red-400": "text-[var(--danger-color)]",
  "text-red-500": "text-[var(--danger-color)]",
  "text-red-600": "text-[var(--danger-color)]",

  "text-yellow-400": "text-[var(--warning-color)]",
  "text-yellow-500": "text-[var(--warning-color)]",
  "text-yellow-600": "text-[var(--warning-color)]",

  /* =========================
     BORDER
  ========================= */

  "border-black": "border-[var(--border-color)]",
  "border-white": "border-[var(--border-color)]",

  "border-gray-100": "border-[var(--border-color)]",
  "border-gray-200": "border-[var(--border-color)]",
  "border-gray-300": "border-[var(--border-color)]",

  "border-blue-500": "border-[var(--primary-color)]",
  "border-green-500": "border-[var(--success-color)]",
  "border-red-500": "border-[var(--danger-color)]",
  "border-yellow-500": "border-[var(--warning-color)]",
};
