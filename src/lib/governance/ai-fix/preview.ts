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
      <div className="w-full max-w-5xl rounded-xl bg-white shadow-2xl overflow-hidden">

        <div className="flex items-center justify-between border-b px-5 py-3">
          <div>
            <h2 className="text-lg font-bold">
              AI Fix Preview
            </h2>

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

        <div className="space-y-6 p-5">

          <div>
            <p className="font-semibold text-sm">
              Title
            </p>

            <p className="text-sm text-gray-700">
              {preview.title}
            </p>
          </div>

          <div>
            <p className="font-semibold text-sm">
              Description
            </p>

            <p className="text-sm text-gray-600">
              {preview.description}
            </p>
          </div>

          <div>
            <p className="mb-2 font-semibold text-sm">
              Current Code
            </p>

            <pre className="overflow-auto rounded-lg bg-gray-900 p-4 text-sm text-red-300">
              <code>
                {preview.oldCode ?? "No previous code"}
              </code>
            </pre>
          </div>

          <div>
            <p className="mb-2 font-semibold text-sm">
              Suggested Code
            </p>

            <pre className="overflow-auto rounded-lg bg-gray-900 p-4 text-sm text-green-300">
              <code>
                {preview.newCode}
              </code>
            </pre>
          </div>

          <div className="flex items-center justify-between border-t pt-4">

            <span
              className={`rounded px-3 py-1 text-xs font-bold ${
                preview.autoApplicable
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {preview.autoApplicable
                ? "Auto Applicable"
                : "Manual Review Required"}
            </span>

            <button
              onClick={onClose}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Close Preview
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}
