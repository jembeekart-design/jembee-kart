"use client";

const cards = [
  {
    title: "Architecture",
    value: "--",
    status: "Waiting",
  },
  {
    title: "Security",
    value: "--",
    status: "Waiting",
  },
  {
    title: "Theme",
    value: "--",
    status: "Waiting",
  },
  {
    title: "Business Rules",
    value: "--",
    status: "Waiting",
  },
  {
    title: "Firestore",
    value: "--",
    status: "Waiting",
  },
  {
    title: "Navigation",
    value: "--",
    status: "Waiting",
  },
];

export default function ControlTowerDashboard() {
  return (
    <main className="min-h-screen p-6 space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          JembeeKart Control Tower
        </h1>

        <p className="text-gray-500 mt-1">
          Production Readiness Dashboard
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border p-4 shadow-sm"
          >
            <h2 className="font-semibold">
              {card.title}
            </h2>

            <div className="text-3xl font-bold mt-3">
              {card.value}
            </div>

            <p className="text-sm text-gray-500 mt-2">
              {card.status}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-5">
        <h2 className="text-xl font-semibold mb-3">
          Scanner Output
        </h2>

        <p className="text-gray-500">
          No scan executed.
        </p>
      </div>

      <div className="rounded-xl border p-5">
        <h2 className="text-xl font-semibold mb-3">
          Fix Center
        </h2>

        <p className="text-gray-500">
          No fixes available.
        </p>
      </div>

    </main>
  );
}
