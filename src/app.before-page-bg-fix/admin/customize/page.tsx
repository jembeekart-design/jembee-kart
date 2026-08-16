"use client";

export default function CustomizePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="rounded-2xl bg-[var(--card-color)] p-8 text-center shadow">
        <h1 className="text-2xl font-bold">
          Customize Page
        </h1>

        <p className="mt-3 text-[var(--muted-text-color)]">
          This page has been merged into Theme Builder.
        </p>

        <p className="mt-2 text-[var(--muted-text-color)]">
          Please use Admin → Theme Builder to customize the website.
        </p>
      </div>
    </main>
  );
}
