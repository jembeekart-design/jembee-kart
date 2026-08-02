import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingScreen({
  message = "Loading...",
  fullScreen = true,
}: LoadingScreenProps) {
  return (
    <div
      className={`${
        fullScreen ? 'fixed inset-0' : 'absolute inset-0'
      } z-50 flex flex-col items-center justify-center bg-[var(--card-color)]`}
    >
      <Loader2 size={48} className="animate-spin text-[var(--primary-color)]" />
      <p className="mt-4 text-sm font-bold text-[var(--text-color)]">{message}</p>
    </div>
  );
}
