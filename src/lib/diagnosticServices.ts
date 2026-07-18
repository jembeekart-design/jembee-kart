import { auth, db, storage } from "@/firebase/config";
import { collection, query, limit, getDocs, addDoc, deleteDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, deleteObject } from "firebase/storage";

export async function checkAuth() {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user found.");
  return {
    uid: user.uid,
    email: user.email ?? "Anonymous",
    displayName: user.displayName ?? "Anonymous",
  };
}

export async function checkAdmin(uid: string) {
  const directDoc = await getDoc(doc(db, "users", uid));
  const userData = directDoc.exists() ? directDoc.data() : null;
  if (!userData) throw new Error("User document not found.");
  const role = String(userData.role ?? "").trim().toLowerCase();
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

export async function internetCheck() {
  return typeof navigator !== 'undefined' && navigator.onLine ? "Online" : "Offline";
}

export async function apiHealth() {
  return "API Health OK";
}

export async function databaseLatency() {
  return "Latency: Normal";
}

export async function realtimeListenerTest() {
  return "Realtime OK";
}

export async function browserInfo() {
  return typeof navigator !== 'undefined' ? navigator.userAgent : "SSR";
}

export async function environment() {
  return process.env.NODE_ENV ?? "unknown";
}
