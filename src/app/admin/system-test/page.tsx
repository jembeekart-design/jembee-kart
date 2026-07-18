"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/config";
import { collection, getDocs, limit, query } from "firebase/firestore";

type TestResult = {
  name: string;
  status: "PASS" | "FAIL" | "RUNNING";
  message: string;
};

export default function SystemTestPage() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(0);

  async function runDiagnostics() {
    setLoading(true);

    const results: TestResult[] = [];

    // Firebase Auth
    try {
      if (auth) {
        results.push({
          name: "Firebase Auth",
          status: "PASS",
          message: "Initialized",
        });
      } else {
        throw new Error();
      }
    } catch {
      results.push({
        name: "Firebase Auth",
        status: "FAIL",
        message: "Initialization Failed",
      });
    }

    // Firestore Read
    try {
      const start = performance.now();

      await getDocs(query(collection(db, "settings"), limit(1)));

      const end = performance.now();

      setResponseTime(Math.round(end - start));

      results.push({
        name: "Firestore Read",
        status: "PASS",
        message: "Connected",
      });
    } catch (e: any) {
      results.push({
        name: "Firestore Read",
        status: "FAIL",
        message: e.message,
      });
    }

    // Environment
    results.push({
      name: "Environment",
      status:
        process.env.NODE_ENV === "production" ? "PASS" : "FAIL",
      message: process.env.NODE_ENV,
    });

    // Browser
    results.push({
      name: "Browser",
      status: "PASS",
      message: navigator.userAgent,
    });

    // Online
    results.push({
      name: "Internet",
      status: navigator.onLine ? "PASS" : "FAIL",
      message: navigator.onLine ? "Online" : "Offline",
    });

    setTests(results);
    setLoading(false);
  }

  useEffect(() => {
    runDiagnostics();
  }, []);

  const pass = tests.filter((x) => x.status === "PASS").length;
  const fail = tests.filter((x) => x.status === "FAIL").length;

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-3xl font-bold">
        🔍 System Live Diagnostics
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="border rounded-xl p-4">
          <div className="text-sm text-gray-500">PASS</div>
          <div className="text-3xl font-bold text-green-600">
            {pass}
          </div>
        </div>

        <div className="border rounded-xl p-4">
          <div className="text-sm text-gray-500">FAIL</div>
          <div className="text-3xl font-bold text-red-600">
            {fail}
          </div>
        </div>

        <div className="border rounded-xl p-4">
          <div className="text-sm text-gray-500">
            Response Time
          </div>
          <div className="text-3xl font-bold">
            {responseTime} ms
          </div>
        </div>

        <div className="border rounded-xl p-4">
          <div className="text-sm text-gray-500">
            Environment
          </div>
          <div className="text-xl font-bold">
            {process.env.NODE_ENV}
          </div>
        </div>

      </div>

      <button
        onClick={runDiagnostics}
        disabled={loading}
        className="px-5 py-3 rounded-lg bg-blue-600 text-white"
      >
        {loading ? "Running..." : "Run Live Diagnostics"}
      </button>

      <div className="border rounded-xl overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="text-left p-3">Test</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Message</th>

            </tr>

          </thead>

          <tbody>

            {tests.map((item, index) => (

              <tr key={index} className="border-t">

                <td className="p-3">{item.name}</td>

                <td className="p-3">

                  <span
                    className={`px-3 py-1 rounded text-white ${
                      item.status === "PASS"
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {item.status}
                  </span>

                </td>

                <td className="p-3">
                  {item.message}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}
