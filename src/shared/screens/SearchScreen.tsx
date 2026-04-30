"use client";

import { useSearch } from "@/hooks/useSearch";
import { SearchBar } from "@/shared/ui/SearchBar";

export const SearchScreen = () => {
  const { results, setQuery } = useSearch();

  return (
    <div style={{ padding: 20 }}>
      <SearchBar onSearch={setQuery} />

      {results.map((r: any) => (
        <div key={r.id}>{r.title}</div>
      ))}
    </div>
  );
};