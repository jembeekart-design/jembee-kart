"use client";

import { useSearch } from "@/hooks/useSearch";
import { SearchBar } from "@/shared/ui/SearchBar";

export const SearchScreen = () => {
  const { results, setQuery, query } = useSearch();

  return (
    <div className="min-h-screen bg-bg text-text">

      <div className="container-custom py-6">

        {/* 🔥 HEADER */}
        <h1 className="heading mb-4">🔍 Search</h1>

        {/* 🔥 SEARCH BAR */}
        <div className="mb-6">
          <SearchBar onSearch={setQuery} />
        </div>

        {/* 🔥 EMPTY STATE */}
        {!query ? (
          <div className="glass p-10 text-center">
            <p className="opacity-70">Start typing to search products</p>
          </div>
        ) : results.length === 0 ? (
          <div className="glass p-10 text-center">
            <p className="opacity-70">No results found 😢</p>
          </div>
        ) : (
          <>
            {/* 🔥 RESULT COUNT */}
            <p className="text-sm opacity-70 mb-4">
              {results.length} results found
            </p>

            {/* 🔥 RESULTS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {results.map((r: any) => (
                <div key={r.id} className="card group">

                  {/* IMAGE */}
                  <div className="h-32 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 mb-3" />

                  {/* TITLE */}
                  <p className="font-medium">{r.title}</p>

                  {/* PRICE */}
                  <p className="text-sm opacity-70">₹{r.price || 999}</p>

                  {/* ACTION */}
                  <button className="btn-primary w-full mt-3 group-hover:scale-105 transition">
                    View
                  </button>

                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
};
