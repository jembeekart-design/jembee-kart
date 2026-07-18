"use client";

export default function DebugPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        🛠️ JembeeKart Debug Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* Firebase */}
        <div className="border rounded-xl p-5 shadow">
          <h2 className="text-xl font-semibold mb-3">
            🔥 Firebase
          </h2>

          <p>Status: Loading...</p>
        </div>

        {/* Environment */}
        <div className="border rounded-xl p-5 shadow">
          <h2 className="text-xl font-semibold mb-3">
            🌍 Environment
          </h2>

          <p>Status: Loading...</p>
        </div>

        {/* Firestore */}
        <div className="border rounded-xl p-5 shadow">
          <h2 className="text-xl font-semibold mb-3">
            🗄 Firestore
          </h2>

          <p>Status: Loading...</p>
        </div>

      </div>
    </div>
  );
}
