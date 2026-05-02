"use client";

import { useState } from "react";

export const useSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);

  return { query, setQuery, results };
};
