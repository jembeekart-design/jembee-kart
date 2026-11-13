/** Discovery category filtering shared by Explore UI and future catalog APIs. */
export interface DiscoveryCategoryRecord {
  id: string;
  name: string;
  description: string;
  topics: readonly string[];
}

/** Normalize user-entered search text without changing the source catalog. */
export function normalizeDiscoveryQuery(query: string): string {
  return query.normalize("NFKC").trim().toLocaleLowerCase();
}

/** Match category name, description, or topic; empty queries return the full catalog. */
export function filterDiscoveryCategories<T extends DiscoveryCategoryRecord>(
  categories: readonly T[],
  query: string,
): T[] {
  const normalized = normalizeDiscoveryQuery(query);
  if (!normalized) return [...categories];
  return categories.filter((category) =>
    [category.name, category.description, ...category.topics]
      .some((value) => normalizeDiscoveryQuery(value).includes(normalized)),
  );
}
