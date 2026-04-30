"use client";

import { useEffect, useState } from "react";
import { searchStore } from "@/shared/store/searchStore";

export const useSearch = () => {
  const [state, setState] = useState(searchStore.get());

  useEffect(() => {
    return searchStore.subscribe(setState);
  }, []);

  return {
    query: state.query,
    results: state.results,
    setQuery: searchStore.setQuery,
    setResults: searchStore.setResults,
  };
};