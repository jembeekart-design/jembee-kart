// src/shared/api/client.ts

import { ENV } from "../config/env";
import { getSession } from "../auth/session";
import {
  applyRequestInterceptors,
  applyResponseInterceptors,
} from "./interceptors";

export type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

const BASE_URL = ENV.API_URL || "";

// 🔹 low-level request
async function rawRequest<T = any>(url: string, options: ApiOptions = {}): Promise<T> {
  const session = getSession();
  const token = session?.accessToken || session?.token || "";

  const init: RequestInit = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  };

  // 🔥 request interceptors (logging, headers, etc.)
  const req = await applyRequestInterceptors({ url, init });

  const res = await fetch(req.url, req.init);

  // 🔥 response interceptors (retry, error normalize, etc.)
  const finalRes = await applyResponseInterceptors(res, req);

  const contentType = finalRes.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await finalRes.json()
    : await finalRes.text();

  if (!finalRes.ok) {
    const error = {
      status: finalRes.status,
      message: (data && data.message) || finalRes.statusText,
      data,
    };
    throw error;
  }

  return data as T;
}

// 🔹 public API helpers
export const api = {
  get: <T = any>(path: string, headers?: Record<string, string>) =>
    rawRequest<T>(`${BASE_URL}${path}`, { method: "GET", headers }),

  post: <T = any>(path: string, body?: any, headers?: Record<string, string>) =>
    rawRequest<T>(`${BASE_URL}${path}`, { method: "POST", body, headers }),

  put: <T = any>(path: string, body?: any, headers?: Record<string, string>) =>
    rawRequest<T>(`${BASE_URL}${path}`, { method: "PUT", body, headers }),

  patch: <T = any>(path: string, body?: any, headers?: Record<string, string>) =>
    rawRequest<T>(`${BASE_URL}${path}`, { method: "PATCH", body, headers }),

  delete: <T = any>(path: string, headers?: Record<string, string>) =>
    rawRequest<T>(`${BASE_URL}${path}`, { method: "DELETE", headers }),
};

// 🔹 file upload (keeps glass UI responsive with progress hooks later)
export const upload = async <T = any>(
  path: string,
  file: File,
  extra?: Record<string, any>
): Promise<T> => {
  const session = getSession();
  const token = session?.accessToken || session?.token || "";

  const form = new FormData();
  form.append("file", file);
  Object.entries(extra || {}).forEach(([k, v]) => form.append(k, String(v)));

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });

  const data = await res.json();
  if (!res.ok) throw data;
  return data as T;
};