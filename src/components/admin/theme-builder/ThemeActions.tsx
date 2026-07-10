"use client";

import {
  Save,
  RotateCcw,
  CheckCircle2,
  Wand2,
} from "lucide-react";

type Props = {
  onSave: () => void | Promise<void>;
  onReset?: () => void;
  onApply?: () => void;
  onGenerateAI?: () => void;
  saving?: boolean;
};

export default function ThemeActions({
  onSave,
  onReset,
  onApply,
  onGenerateAI,
  saving = false,
}: Props) {

  return (

    <div className="mt-8 rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] p-6">

      <h2 className="mb-6 text-2xl font-bold">
        Theme Actions
      </h2>

      <div className="flex flex-wrap gap-4">

        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary-color)] px-6 py-3 font-bold text-[var(--text-color)] transition hover:scale-105 disabled:opacity-60"
        >
          <Save size={18} />

          {saving
            ? "Saving..."
            : "Save Theme"}

        </button>

        <button
          onClick={onApply}
          className="flex items-center gap-2 rounded-xl bg-[var(--success-color)] px-6 py-3 font-bold text-[var(--text-color)] transition hover:scale-105"
        >
          <CheckCircle2 size={18} />

          Apply Theme

        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-xl bg-[var(--warning-color)] px-6 py-3 font-bold text-[var(--text-color)] transition hover:scale-105"
        >
          <RotateCcw size={18} />

          Reset Theme

        </button>

        <button
          onClick={onGenerateAI}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary-color)] px-6 py-3 font-bold text-[var(--button-text-color)] transition hover:scale-105"
        >
          <Wand2 size={18} />

          AI Theme

        </button>

      </div>

      <div className="mt-6 rounded-xl border border-[var(--primary-color)]/20 bg-[var(--primary-color)]/10 p-4">

        <h3 className="font-bold text-[var(--primary-color)]">
          Theme Builder Status
        </h3>

        <p className="mt-2 text-sm text-[var(--text-color)]">
          All theme settings are managed from the
          Admin Panel and stored in Firestore.
          After saving, every page of JembeeKart
          can use the same theme configuration.
        </p>

      </div>

    </div>

  );

}
