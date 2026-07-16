"use client";

import type { PreviewResult } from "@/lib/governance/ai-fix/preview";

interface Props {
  preview: PreviewResult | null;
  onClose: () => void;
}

export default function AIFixPreview({
  preview,
  onClose,
}: Props) {
  if (!preview) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div>
            <h2 className="text-lg font-bold">AI Fix Preview</h2>
            <p className="text-xs text-gray-500">
              {preview.file}:{preview.lineStart}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded border px-3 py-1 text-sm hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-sm font-semibold">Description</p>
            <p className="text-sm text-gray-600">
              {preview.description}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">
              Suggested Code
            </p>

            <pre className="overflow-auto rounded-lg bg-gray-900 p-4 text-sm text-green-300">
              <code>{preview.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
