import React from "react";

export function AdSlotPlaceholder({ slotName, networkName }: { slotName: string; networkName: string }) {
  return (
    <div 
      className="bg-[var(--color-card-background)] text-[var(--text-muted)] border border-[var(--color-border)] p-4 rounded-2xl flex flex-col items-center justify-center min-h-[100px]"
    >
      <p className="text-sm font-bold">{networkName} Slot: {slotName}</p>
      <p className="text-xs opacity-70">(Test Mode)</p>
    </div>
  );
}
