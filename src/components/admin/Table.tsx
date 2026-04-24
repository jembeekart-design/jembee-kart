'use client';

import { useEffect, useState } from "react";

type Column = {
  key: string;
  label: string;
};

type Props = {
  columns: Column[];
  data: any[];
};

export default function Table({ columns, data }: Props) {
  const [themeColor, setThemeColor] = useState("#6366f1");

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);
  }, []);

  return (
    <div className="glass rounded-2xl p-5 overflow-x-auto">
      <table className="w-full text-left text-white">
        {/* Head */}
        <thead className="text-sm opacity-70">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="p-3">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-10 opacity-50"
              >
                No data found 🚀
              </td>
            </tr>
          )}

          {data.map((row, i) => (
            <tr
              key={i}
              className="border-t border-white/10 hover:bg-white/5 transition"
            >
              {columns.map((col) => (
                <td key={col.key} className="p-3">
                  {/* Special styling for price */}
                  {typeof row[col.key] === "number" ? (
                    <span style={{ color: themeColor }}>
                      {row[col.key]}
                    </span>
                  ) : (
                    row[col.key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
