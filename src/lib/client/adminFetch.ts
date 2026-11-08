import { auth } from "@/firebase/config";

/** Fetch helper for protected same-origin admin APIs. */
export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Admin login required");
  const token = await user.getIdToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers, cache: init.cache ?? "no-store" });
}
