import { auth, db, storage } from "@/firebase/config";
import { collection, query, where, limit, getDocs, addDoc, deleteDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, deleteObject } from "firebase/storage";

// --- EXISTING SERVICES ---
export async function checkAuth() {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user found.");
  return `UID: ${user.uid} (${user.email ?? "Anonymous"})`;
}

export async function checkAdmin(uid: string) {
  const directDoc = await getDoc(doc(db, "users", uid));
  const userData = directDoc.exists() ? directDoc.data() : null;
  
  if (!userData) throw new Error("User document not found.");
  
  const role = String(userData.role ?? "").trim().toLowerCase();
  const ADMIN_ROLES = ["admin", "superadmin", "super_admin", "owner", "developer"];
  
  if (!ADMIN_ROLES.includes(role)) throw new Error(`Access Denied (${role || "Unknown"})`);
  return `Authorized as ${role}`;
}

export async function firestoreRead() {
  await getDocs(query(collection(db, "users"), limit(1)));
  return "Firestore Read Successful";
}

export async function firestoreWriteDelete() {
  const docRef = await addDoc(collection(db, "system_test"), { createdAt: serverTimestamp(), status: "test" });
  await deleteDoc(doc(db, "system_test", docRef.id));
  return "Write/Delete Successful";
}

export async function storageTest() {
  const storageRef = ref(storage, `system-test/${Date.now()}.txt`);
  await uploadBytes(storageRef, new Blob(["Test"], { type: "text/plain" }));
  await deleteObject(storageRef);
  return "Storage Upload/Delete Successful";
}

// --- NEW PRODUCTION-READY DIAGNOSTICS ---

export async function internetCheck() {
  if (!navigator.onLine) throw new Error("No Internet Connection");
  return "Internet Connected";
}

export async function databaseLatency() {
  const start = performance.now();
  await getDocs(query(collection(db, "users"), limit(1)));
  return `${Math.round(performance.now() - start)} ms`;
}

export async function realtimeListenerTest() {
  const snap = await getDocs(query(collection(db, "users"), limit(1)));
  if (snap.empty) throw new Error("No data available");
  return "Realtime Read Successful";
}

export async function firestoreSecurityTest() {
  await getDocs(query(collection(db, "users"), limit(1)));
  return "Firestore Rules Allow Read";
}

export async function apiHealth(url = "/api/system-test") {
  const start = performance.now();
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return `${response.status} (${Math.round(performance.now() - start)} ms)`;
}

export async function browserInfo() {
  return `${navigator.platform} | ${navigator.language}`;
}

export async function currentTime() {
  return new Date().toLocaleTimeString();
}

export async function environment() {
  return process.env.NODE_ENV ?? "unknown";
}
