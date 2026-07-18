import { auth, db, storage } from "@/firebase/config";

import {
  collection,
  query,
  where,
  limit,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";

/* ============================================================
   AUTH CHECK
============================================================ */

export async function checkAuth() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No authenticated user found.");
  }

  return {
    uid: user.uid,
    email: user.email ?? "No Email",
    emailVerified: user.emailVerified,
    displayName: user.displayName ?? "Anonymous",
  };
}

/* ============================================================
   ADMIN PERMISSION CHECK
============================================================ */

export async function checkAdmin(uid: string) {
  // First try document id = uid
  let userData: any = null;

  const directDoc = await getDoc(doc(db, "users", uid));

  if (directDoc.exists()) {
    userData = directDoc.data();
  } else {
    // Fallback: search using uid field
    const q = query(
      collection(db, "users"),
      where("uid", "==", uid),
      limit(1)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      userData = snap.docs[0].data();
    }
  }

  if (!userData) {
    throw new Error("User document not found.");
  }

  const role = String(userData.role ?? "")
    .trim()
    .toLowerCase();

  const ADMIN_ROLES = [
    "admin",
    "superadmin",
    "super_admin",
    "owner",
    "developer",
  ];

  if (!ADMIN_ROLES.includes(role)) {
    throw new Error(`Access Denied (${role || "Unknown"})`);
  }

  return {
    role,
    message: `Authorized as ${role}`,
  };
}

/* ============================================================
   FIRESTORE READ TEST
============================================================ */

export async function firestoreRead() {
  const q = query(
    collection(db, "users"),
    limit(1)
  );

  await getDocs(q);

  return "Firestore Read Successful";
}

/* ============================================================
   FIRESTORE WRITE + DELETE TEST
============================================================ */

export async function firestoreWriteDelete() {
  const docRef = await addDoc(
    collection(db, "system_test"),
    {
      createdAt: serverTimestamp(),
      source: "System Monitor",
      status: "PASS",
    }
  );

  await deleteDoc(doc(db, "system_test", docRef.id));

  return "Firestore Write/Delete Successful";
}

/* ============================================================
   STORAGE TEST
============================================================ */

export async function storageTest() {
  const path = `system-test/${Date.now()}.txt`;

  const storageRef = ref(storage, path);

  const blob = new Blob(
    [
      "JembeeKart Enterprise System Test",
    ],
    {
      type: "text/plain",
    }
  );

  await uploadBytes(storageRef, blob);

  await deleteObject(storageRef);

  return "Storage Upload/Delete Successful";
}
