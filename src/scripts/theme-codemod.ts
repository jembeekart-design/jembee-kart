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
function replaceRegex(content: string): string {
  return content

    // HEX Colors
    .replace(/bg-\[#([0-9a-fA-F]{3,8})\]/g, "bg-[var(--card-color)]")
    .replace(/text-\[#([0-9a-fA-F]{3,8})\]/g, "text-[var(--text-color)]")
    .replace(/border-\[#([0-9a-fA-F]{3,8})\]/g, "border-[var(--border-color)]")

    // Black opacity
    .replace(/bg-black\/\d+/g, "bg-[var(--card-color)]")
    .replace(/text-black\/\d+/g, "text-[var(--text-color)]")
    .replace(/border-black\/\d+/g, "border-[var(--border-color)]")

    // White opacity
    .replace(/bg-white\/\d+/g, "bg-[var(--background-color)]")
    .replace(/text-white\/\d+/g, "text-[var(--button-text-color)]")
    .replace(/border-white\/\d+/g, "border-[var(--border-color)]")

    // Gray
    .replace(/bg-gray-\d+/g, "bg-[var(--card-color)]")
    .replace(/text-gray-\d+/g, "text-[var(--muted-text-color)]")
    .replace(/border-gray-\d+/g, "border-[var(--border-color)]")

    // Blue
    .replace(/bg-blue-\d+/g, "bg-[var(--primary-color)]")
    .replace(/text-blue-\d+/g, "text-[var(--primary-color)]")
    .replace(/border-blue-\d+/g, "border-[var(--primary-color)]")

    // Green
    .replace(/bg-green-\d+/g, "bg-[var(--success-color)]")
    .replace(/text-green-\d+/g, "text-[var(--success-color)]")
    .replace(/border-green-\d+/g, "border-[var(--success-color)]")

    // Red
    .replace(/bg-red-\d+/g, "bg-[var(--danger-color)]")
    .replace(/text-red-\d+/g, "text-[var(--danger-color)]")
    .replace(/border-red-\d+/g, "border-[var(--danger-color)]")

    // Yellow
    .replace(/bg-yellow-\d+/g, "bg-[var(--warning-color)]")
    .replace(/text-yellow-\d+/g, "text-[var(--warning-color)]")
    .replace(/border-yellow-\d+/g, "border-[var(--warning-color)]")

    // Hover
    .replace(/hover:bg-blue-\d+/g, "hover:bg-[var(--primary-color)]")
    .replace(/hover:bg-red-\d+/g, "hover:bg-[var(--danger-color)]")
    .replace(/hover:bg-green-\d+/g, "hover:bg-[var(--success-color)]")
    .replace(/hover:bg-yellow-\d+/g, "hover:bg-[var(--warning-color)]")

    .replace(/hover:text-blue-\d+/g, "hover:text-[var(--primary-color)]")
    .replace(/hover:text-red-\d+/g, "hover:text-[var(--danger-color)]")
    .replace(/hover:text-green-\d+/g, "hover:text-[var(--success-color)]")
    .replace(/hover:text-yellow-\d+/g, "hover:text-[var(--warning-color)]")

    // Focus
    .replace(/focus:bg-blue-\d+/g, "focus:bg-[var(--primary-color)]")
    .replace(/focus:text-blue-\d+/g, "focus:text-[var(--primary-color)]")

    // Ring
    .replace(/ring-blue-\d+/g, "ring-[var(--primary-color)]")
    .replace(/ring-red-\d+/g, "ring-[var(--danger-color)]")
    .replace(/ring-green-\d+/g, "ring-[var(--success-color)]")
    .replace(/ring-yellow-\d+/g, "ring-[var(--warning-color)]");
}
