"use client";

export default function CategorySkeleton() {
  return (
    <div className="w-full animate-pulse overflow-hidden rounded-[28px] bg-white shadow-xl">

      {/* IMAGE SKELETON */}

      <div className="h-[170px] w-full bg-gray-300" />

      {/* CONTENT */}

      <div className="p-4">

        <div className="h-6 w-2/3 rounded-xl bg-gray-300" />

      </div>

    </div>
  );
}
