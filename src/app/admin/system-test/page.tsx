"use client";

import { useState } from "react";
import { auth, db } from "@/firebase/config";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  limit,
} from "firebase/firestore";

type TestResult = {
  name: string;
  status: "PASS" | "FAIL";
  message: string;
};

export default function SystemTestPage() {
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(0);
  const [healthScore, setHealthScore] = useState(100);
  const [results, setResults] = useState<TestResult[]>([]);

  const passCount = results.filter(
    (item) => item.status === "PASS"
  ).length;

  const failCount = results.filter(
    (item) => item.status === "FAIL"
  ).length;

  // 👉 Part 2 में runDiagnostics() आएगा
  async function runDiagnostics() {
  setLoading(true);

  const start = performance.now();

  const testResults: TestResult[] = [];

  try {
    // ==========================
    // Internet Test
    // ==========================
    if (navigator.onLine) {
      testResults.push({
        name: "Internet Connection",
        status: "PASS",
        message: "Connected",
      });
    } else {
      testResults.push({
        name: "Internet Connection",
        status: "FAIL",
        message: "Offline",
      });
    }

    // ==========================
    // Firebase Authentication
    // ==========================
    const user = auth.currentUser;

    if (user) {
      testResults.push({
        name: "Firebase Auth",
        status: "PASS",
        message: "Logged In",
      });

      testResults.push({
        name: "Current User UID",
        status: "PASS",
        message: user.uid,
      });

      testResults.push({
        name: "Current User Email",
        status: "PASS",
        message: user.email ?? "No Email",
      });
    } else {
      testResults.push({
        name: "Firebase Auth",
        status: "FAIL",
        message: "User Not Logged In",
      });
    }

    // ==========================
    // Firestore Read Test
    // ==========================
    const q = query(
      collection(db, "system_test"),
      limit(1)
    );

    await getDocs(q);

    testResults.push({
      name: "Firestore Read",
      status: "PASS",
      message: "Read Successful",
    });

    // ==========================
    // Firestore Write Test
    // ==========================
    const docRef = await addDoc(
      collection(db, "system_test"),
      {
        createdAt: Date.now(),
        source: "System Diagnostics",
        status: "test",
      }
    );

    testResults.push({
      name: "Firestore Write",
      status: "PASS",
      message: docRef.id,
    });

    // ==========================
    // Firestore Delete Test
    // ==========================
    await deleteDoc(
      doc(db, "system_test", docRef.id)
    );

    testResults.push({
      name: "Firestore Delete",
      status: "PASS",
      message: "Deleted Successfully",
    });

  } catch (error: any) {
    testResults.push({
      name: "Diagnostics",
      status: "FAIL",
      message: error.message,
    });
  }

  const end = performance.now();

  const time = Math.round(end - start);

  setResponseTime(time);

  const pass = testResults.filter(
    (x) => x.status === "PASS"
  ).length;

  const total = testResults.length;

  const score =
    total === 0
      ? 0
      : Math.round((pass / total) * 100);

  setHealthScore(score);

  setResults(testResults);

  setLoading(false);
}
  // ==========================
// Admin Permission Test
// ==========================
try {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();

    const role = String(data.role ?? "").toLowerCase();

    if (role === "admin" || role === "superadmin") {
      testResults.push({
        name: "Admin Permission",
        status: "PASS",
        message: `Authorized (${role})`,
      });
    } else {
      testResults.push({
        name: "Admin Permission",
        status: "FAIL",
        message: `Access Denied (${role || "No Role"})`,
      });
    }
  } else {
    testResults.push({
      name: "Admin Permission",
      status: "FAIL",
      message: "User document not found",
    });
  }
} catch (e: any) {
  testResults.push({
    name: "Admin Permission",
    status: "FAIL",
    message: e.message,
  });
}
  // ==========================
// Firebase Storage Upload Test
// ==========================
try {
  const fileName = `system-test/${Date.now()}.txt`;

  const storageRef = ref(storage, fileName);

  const file = new Blob(
    [
      `JembeeKart System Test
Time: ${new Date().toISOString()}
`,
    ],
    {
      type: "text/plain",
    }
  );

  await uploadBytes(storageRef, file);

  testResults.push({
    name: "Storage Upload",
    status: "PASS",
    message: "Upload Successful",
  });

  // Delete uploaded file
  await deleteObject(storageRef);

  testResults.push({
    name: "Storage Delete",
    status: "PASS",
    message: "Delete Successful",
  });

} catch (e: any) {
  testResults.push({
    name: "Storage Upload/Delete",
    status: "FAIL",
    message: e.message,
  });
}

// ==========================
// Firebase Storage Upload Test
// ==========================
try {
  const fileName = `system-test/${Date.now()}.txt`;

  const storageRef = ref(storage, fileName);

  const file = new Blob(
    [
      `JembeeKart System Test
Time: ${new Date().toISOString()}
`,
    ],
    {
      type: "text/plain",
    }
  );

  await uploadBytes(storageRef, file);

  testResults.push({
    name: "Storage Upload",
    status: "PASS",
    message: "Upload Successful",
  });

  // Delete uploaded file
  await deleteObject(storageRef);

  testResults.push({
    name: "Storage Delete",
    status: "PASS",
    message: "Delete Successful",
  });

} catch (e: any) {
  testResults.push({
    name: "Storage Upload/Delete",
    status: "FAIL",
    message: e.message,
  });
}
  for (const route of apiRoutes) {
  try {
    const apiStart = performance.now();

    const response = await fetch(route, {
      cache: "no-store",
    });

    const apiEnd = performance.now();

    const apiTime = Math.round(apiEnd - apiStart);

    testResults.push({
      name: `API ${route}`,
      status: response.ok ? "PASS" : "FAIL",
      message: `${response.status} (${apiTime} ms)`,
    });

  } catch (e: any) {
    testResults.push({
      name: `API ${route}`,
      status: "FAIL",
      message: e.message,
    });
  }
}
  
