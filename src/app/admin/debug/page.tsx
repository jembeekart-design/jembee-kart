"use client";

import { useEffect, useState } from "react";

import {
  app,
  auth,
  db,
  storage,
} from "@/firebase/config";

import {
  collection,
  getDocs,
  limit,
  query,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

type DebugState = {
  loading: boolean;

  firebase: {
    app: boolean;
    auth: boolean;
    firestore: boolean;
    storage: boolean;
  };

  auth: {
    initialized: boolean;
    loggedIn: boolean;
    uid: string;
    email: string;
  };

  firestore: {
    connected: boolean;
    latency: number;
    error: string;
  };

  env: {
    apiKey: string;
    projectId: string;
    authDomain: string;
    storageBucket: string;
    appId: string;
  };

  health: number;

  logs: string[];
};

export default function DebugPage() {
  const [state, setState] = useState<DebugState>({
    loading: true,

    firebase: {
      app: false,
      auth: false,
      firestore: false,
      storage: false,
    },

    auth: {
      initialized: false,
      loggedIn: false,
      uid: "",
      email: "",
    },

    firestore: {
      connected: false,
      latency: 0,
      error: "",
    },

    env: {
      apiKey:
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
      projectId:
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
      authDomain:
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
      storageBucket:
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
      appId:
        process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
    },

    health: 0,

    logs: [],
  });

  function addLog(message: string) {
    setState((prev) => ({
      ...prev,
      logs: [
        ...prev.logs,
        `${new Date().toLocaleTimeString()}  ${message}`,
      ],
    }));
  }

  useEffect(() => {
    async function initialize() {
      try {
        addLog("Starting Debug Dashboard");

        setState((prev) => ({
          ...prev,

          firebase: {
            app: !!app,
            auth: !!auth,
            firestore: !!db,
            storage: !!storage,
          },
        }));

        addLog("Firebase initialized");

        onAuthStateChanged(auth, (user) => {
          setState((prev) => ({
            ...prev,

            auth: {
              initialized: true,
              loggedIn: !!user,
              uid: user?.uid ?? "",
              email: user?.email ?? "",
            },
          }));
        });

        const start = performance.now();

        await getDocs(
          query(
            collection(db, "settings"),
            limit(1)
          )
        );

        const end = performance.now();

        setState((prev) => ({
          ...prev,

          firestore: {
            connected: true,
            latency: Math.round(end - start),
            error: "",
          },
        }));

        addLog("Firestore connected");

        setState((prev) => ({
          ...prev,
          loading: false,
        }));
      } catch (error: any) {
        console.error(error);

        addLog(error.message);

        setState((prev) => ({
          ...prev,

          firestore: {
            connected: false,
            latency: 0,
            error: error.message,
          },

          loading: false,
        }));
      }
    }

    initialize();
  }, []);
    const health =
    [
      state.firebase.app,
      state.firebase.auth,
      state.firebase.firestore,
      state.firebase.storage,
      state.firestore.connected,
    ].filter(Boolean).length * 20;

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-3xl font-bold mb-6">
        🛠 JembeeKart Debug Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {/* Firebase */}
        <div className="rounded-xl bg-white shadow border p-5">
          <h2 className="text-xl font-bold mb-4">
            🔥 Firebase
          </h2>

          <p>App : {state.firebase.app ? "✅" : "❌"}</p>
          <p>Auth : {state.firebase.auth ? "✅" : "❌"}</p>
          <p>Firestore : {state.firebase.firestore ? "✅" : "❌"}</p>
          <p>Storage : {state.firebase.storage ? "✅" : "❌"}</p>
        </div>

        {/* Environment */}
        <div className="rounded-xl bg-white shadow border p-5">
          <h2 className="text-xl font-bold mb-4">
            🌍 Environment
          </h2>

          <p>
            API Key :
            {state.env.apiKey
              ? ` ${state.env.apiKey.slice(0, 6)}********`
              : " ❌"}
          </p>

          <p>Project : {state.env.projectId}</p>

          <p>Domain : {state.env.authDomain}</p>

          <p>Storage : {state.env.storageBucket}</p>

          <p>
            App ID :
            {state.env.appId
              ? state.env.appId.slice(0, 18) + "..."
              : ""}
          </p>
        </div>

        {/* Firestore */}
        <div className="rounded-xl bg-white shadow border p-5">
          <h2 className="text-xl font-bold mb-4">
            🗄 Firestore
          </h2>

          <p>
            Status :
            {state.firestore.connected ? " ✅" : " ❌"}
          </p>

          <p>
            Latency :
            {state.firestore.latency} ms
          </p>

          <p className="text-red-600 break-all">
            {state.firestore.error}
          </p>
        </div>

        {/* Authentication */}
        <div className="rounded-xl bg-white shadow border p-5">
          <h2 className="text-xl font-bold mb-4">
            👤 Authentication
          </h2>

          <p>
            Initialized :
            {state.auth.initialized ? " ✅" : " ❌"}
          </p>

          <p>
            Logged In :
            {state.auth.loggedIn ? " ✅" : " ❌"}
          </p>

          <p className="break-all">
            UID : {state.auth.uid || "-"}
          </p>

          <p className="break-all">
            Email : {state.auth.email || "-"}
          </p>
        </div>

        {/* Overall Health */}
        <div className="rounded-xl bg-white shadow border p-5">
          <h2 className="text-xl font-bold mb-4">
            ❤️ Overall Health
          </h2>

          <div className="text-5xl font-bold">
            {health}%
          </div>

          <div className="mt-3 h-3 rounded bg-gray-200">
            <div
              className="h-3 rounded bg-green-500"
              style={{
                width: `${health}%`,
              }}
            />
          </div>
        </div>

      </div>
      const health =
  [
    state.firebase.app,
    state.firebase.auth,
    state.firebase.firestore,
    state.firebase.storage,
    state.firestore.connected,
  ].filter(Boolean).length * 20;

return (
  <div className="min-h-screen bg-gray-100 p-6">

    <h1 className="text-3xl font-bold mb-6">
      🛠 JembeeKart Debug Dashboard
    </h1>

    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

      {/* Firebase */}
      <div className="rounded-xl bg-white shadow border p-5">
        <h2 className="text-xl font-bold mb-4">
          🔥 Firebase
        </h2>

        <p>App : {state.firebase.app ? "✅" : "❌"}</p>
        <p>Auth : {state.firebase.auth ? "✅" : "❌"}</p>
        <p>Firestore : {state.firebase.firestore ? "✅" : "❌"}</p>
        <p>Storage : {state.firebase.storage ? "✅" : "❌"}</p>
      </div>

      {/* Environment */}
      <div className="rounded-xl bg-white shadow border p-5">
        <h2 className="text-xl font-bold mb-4">
          🌍 Environment
        </h2>

        <p>
          API Key:
          {state.env.apiKey
            ? ` ${state.env.apiKey.slice(0, 6)}********`
            : " ❌"}
        </p>

        <p>Project: {state.env.projectId}</p>
        <p>Domain: {state.env.authDomain}</p>
        <p>Storage: {state.env.storageBucket}</p>

        <p>
          App ID:
          {state.env.appId
            ? state.env.appId.slice(0, 18) + "..."
            : ""}
        </p>
      </div>

      {/* Firestore */}
      <div className="rounded-xl bg-white shadow border p-5">
        <h2 className="text-xl font-bold mb-4">
          🗄 Firestore
        </h2>

        <p>Status: {state.firestore.connected ? "✅" : "❌"}</p>
        <p>Latency: {state.firestore.latency} ms</p>

        <p className="text-red-600 break-all">
          {state.firestore.error}
        </p>
      </div>

      {/* Authentication */}
      <div className="rounded-xl bg-white shadow border p-5">
        <h2 className="text-xl font-bold mb-4">
          👤 Authentication
        </h2>

        <p>Initialized: {state.auth.initialized ? "✅" : "❌"}</p>
        <p>Logged In: {state.auth.loggedIn ? "✅" : "❌"}</p>

        <p className="break-all">
          UID: {state.auth.uid || "-"}
        </p>

        <p className="break-all">
          Email: {state.auth.email || "-"}
        </p>
      </div>

      {/* Overall Health */}
      <div className="rounded-xl bg-white shadow border p-5">
        <h2 className="text-xl font-bold mb-4">
          ❤️ Overall Health
        </h2>

        <div className="text-5xl font-bold">
          {health}%
        </div>

        <div className="mt-3 h-3 rounded bg-gray-200">
          <div
            className="h-3 rounded bg-green-500"
            style={{ width: `${health}%` }}
          />
        </div>
      </div>

    </div>
  </div>
);
      {/* Logs */}
<div className="rounded-xl bg-white shadow border p-5 md:col-span-2 xl:col-span-3">
  <h2 className="text-xl font-bold mb-4">
    📋 Live Logs
  </h2>

  <div className="bg-black text-green-400 rounded-lg p-3 h-80 overflow-y-auto font-mono text-sm">
    {state.logs.length === 0 ? (
      <p>No logs yet...</p>
    ) : (
      state.logs.map((log, index) => (
        <div key={index}>
          {log}
        </div>
      ))
    )}
  </div>
</div>

{/* Errors */}
<div className="rounded-xl bg-white shadow border p-5 md:col-span-2 xl:col-span-3">
  <h2 className="text-xl font-bold mb-4 text-red-600">
    🚨 Error Monitor
  </h2>

  {state.firestore.error ? (
    <div className="rounded bg-red-100 border border-red-300 p-3 text-red-700 break-all">
      {state.firestore.error}
    </div>
  ) : (
    <div className="rounded bg-green-100 border border-green-300 p-3 text-green-700">
      No errors detected ✅
    </div>
  )}
</div>
