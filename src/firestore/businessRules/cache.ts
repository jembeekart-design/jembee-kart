import {
  CacheEntry,
} from "./types";

import {
  BUSINESS_RULES_CACHE_TTL,
} from "./defaults";

// ======================================================
// JembeeKart Business Rules Cache
// Production Ready
// ======================================================

class BusinessRulesCache {

  private readonly cache =
    new Map<
      string,
      CacheEntry<unknown>
    >();

  // ----------------------------------------------------
  // Get
  // ----------------------------------------------------

  get<T>(
    key: string
  ): T | null {

    const item =
      this.cache.get(key);

    if (!item) {
      return null;
    }

    if (
      Date.now() >
      item.expiresAt
    ) {

      this.cache.delete(key);

      return null;

    }

    return item.value as T;

  }

  // ----------------------------------------------------
  // Set
  // ----------------------------------------------------

  set<T>(
    key: string,
    value: T,
    ttl: number =
      BUSINESS_RULES_CACHE_TTL
  ): void {

    this.cache.set(key, {

      value,

      expiresAt:
        Date.now() + ttl,

    });

  }

  // ----------------------------------------------------
  // Has
  // ----------------------------------------------------

  has(
    key: string
  ): boolean {

    return this.get(key) !== null;

  }

  // ----------------------------------------------------
  // Delete
  // ----------------------------------------------------

  delete(
    key: string
  ): void {

    this.cache.delete(key);

  }

  // ----------------------------------------------------
  // Clear
  // ----------------------------------------------------

  clear(): void {

    this.cache.clear();

  }

  // ----------------------------------------------------
  // Size
  // ----------------------------------------------------

  size(): number {

    return this.cache.size;

  }

  // ----------------------------------------------------
  // Keys
  // ----------------------------------------------------

  keys(): string[] {

    return [
      ...this.cache.keys(),
    ];

  }

  // ----------------------------------------------------
  // Cleanup Expired
  // ----------------------------------------------------

  cleanup(): void {

    const now =
      Date.now();

    for (
      const [
        key,
        value,
      ] of this.cache
    ) {

      if (
        value.expiresAt <
        now
      ) {

        this.cache.delete(
          key
        );

      }

    }

  }

  // ----------------------------------------------------
  // Cache Info
  // ----------------------------------------------------

  getStats() {

    this.cleanup();

    return {

      totalEntries:
        this.cache.size,

      ttl:
        BUSINESS_RULES_CACHE_TTL,

      timestamp:
        new Date().toISOString(),

    };

  }

}

export const businessRulesCache =
  new BusinessRulesCache();
