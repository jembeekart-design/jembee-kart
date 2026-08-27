"use client";

interface ThemeActionsProps {
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
  onApply: () => void;
  onGenerateAI: () => void;
  onUndo: () => void;
}

export default function ThemeActions({ saving, onSave, onReset, onApply, onGenerateAI, onUndo }: ThemeActionsProps) {
  return (
    <div className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow-sm">
      <button onClick={onUndo} className="bg-gray-200 p-2 rounded">Undo</button>
      <button onClick={onReset} className="bg-yellow-500 text-white p-2 rounded">Reset</button>
      <button onClick={onApply} className="bg-green-600 text-white p-2 rounded">Apply Live</button>
      <button onClick={onSave} className="bg-blue-600 text-white p-2 rounded" disabled={saving}>
        {saving ? "Saving..." : "Save to Firestore"}
      </button>
      <button onClick={onGenerateAI} className="bg-purple-600 text-white p-2 rounded">AI Generate</button>
    </div>
  );
}
