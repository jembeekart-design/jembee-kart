"use client";

import { useRouter } from "next/navigation";

export default function GovernanceActions() {
  const router = useRouter();

  return (
    <section className="border-t pt-8">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
        Governance Actions
      </h2>

      <div className="flex flex-wrap gap-3">
        <ActionButton
          onClick={() => router.refresh()}
          label="Reload Config"
        />

        <ActionButton
          onClick={() => {}}
          label="Run Full Audit"
          variant="secondary"
        />

        <ActionButton
          onClick={() => {}}
          label="Clear Cache"
          variant="danger"
        />
      </div>
    </section>
  );
}

function ActionButton({
  onClick,
  label,
  variant = "primary",
}: {
  onClick: () => void;
  label: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  const styles = {
    primary: "bg-gray-900 text-white hover:bg-black",
    secondary: "bg-white border border-gray-200 hover:bg-gray-50",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-bold text-[11px] transition-all ${styles[variant]}`}
    >
      {label}
    </button>
  );
}
