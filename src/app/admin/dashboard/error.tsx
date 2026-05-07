"use client";

export default function Error({
  error,
}: {
  error: Error;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">

      <h1 className="text-4xl font-black">
        Admin Error
      </h1>

      <p className="mt-4 text-white/60">
        {error.message}
      </p>

    </div>
  );
}
