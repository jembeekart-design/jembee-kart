"use client";

type ScannerResult = {
  name: string;
  status: "PASS" | "WARNING" | "FAIL";
  message: string;
};

const scannerResults: ScannerResult[] = [
  {
    name: "Theme Scanner",
    status: "PASS",
    message: "Theme configuration loaded successfully.",
  },
  {
    name: "Firestore Scanner",
    status: "PASS",
    message: "Admin configuration synchronized.",
  },
  {
    name: "Security Scanner",
    status: "WARNING",
    message: "Security checks not connected yet.",
  },
  {
    name: "Hardcoded Rule Scanner",
    status: "WARNING",
    message: "Scanner integration pending.",
  },
];

export default function ScannerResults() {
  return (
    <section className="rounded-xl border bg-white p-6">
      <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-gray-500">
        Scanner Results
      </h2>

      <div className="space-y-3">
        {scannerResults.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-xs text-gray-500">
                {item.message}
              </p>
            </div>

            <span
              className={
                item.status === "PASS"
                  ? "font-bold text-green-600"
                  : item.status === "WARNING"
                  ? "font-bold text-yellow-600"
                  : "font-bold text-red-600"
              }
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
