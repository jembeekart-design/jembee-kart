import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { FIRESTORE_PATHS } from "@/firestore/collections/firestorePaths";
import { AdNetwork, AdSlot } from "@/types/ads";

const NETWORKS_COLLECTION = FIRESTORE_PATHS.AD_MANAGEMENT.NETWORKS;
const SLOTS_COLLECTION = FIRESTORE_PATHS.AD_MANAGEMENT.SLOTS;

// --- Ad Networks ---
export async function addAdNetwork(data: Omit<AdNetwork, "id" | "createdAt" | "updatedAt">) {
  return await addDoc(collection(db, NETWORKS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateAdNetwork(id: string, data: Partial<AdNetwork>) {
  return await updateDoc(doc(db, NETWORKS_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAdNetwork(id: string) {
  return await deleteDoc(doc(db, NETWORKS_COLLECTION, id));
}

// --- Ad Slots ---
export async function addAdSlot(data: Omit<AdSlot, "id" | "createdAt" | "updatedAt">) {
  return await addDoc(collection(db, SLOTS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateAdSlot(id: string, data: Partial<AdSlot>) {
  return await updateDoc(doc(db, SLOTS_COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAdSlot(id: string) {
  return await deleteDoc(doc(db, SLOTS_COLLECTION, id));
}
