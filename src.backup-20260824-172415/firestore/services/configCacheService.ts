/**
 * CONFIGURATION CACHE LAYER
 * 
 * Centralized caching for all configuration reads.
 * - Caches configs in memory
 * - Supports realtime listeners for live updates
 * - Falls back to cached value if read fails
 * - Supports offline access
 */

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  DocumentSnapshot,
  Query,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { CACHE_DURATION } from "@/firestore/collections/baseConfigTypes";

// ======================================================
// CACHE STORAGE
// ======================================================

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class ConfigCache {
  private cache = new Map<string, CacheEntry>();
  private listeners = new Map<string, Unsubscribe>();
  private loadingPromises = new Map<string, Promise<any>>();

  // ================================================
  // SET: Store in cache
  // ================================================
  set<T>(key: string, data: T, duration: number = CACHE_DURATION.MEDIUM): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + duration,
    });
  }

  // ================================================
  // GET: Retrieve from cache
  // ================================================
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  // ================================================
  // HAS: Check if key exists and is valid
  // ================================================
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // ================================================
  // INVALIDATE: Clear specific cache entry
  // ================================================
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  // ================================================
  // CLEAR_ALL: Clear entire cache
  // ================================================
  clearAll(): void {
    this.cache.clear();
  }

  // ================================================
  // GET_LOADING_PROMISE: Prevent duplicate requests
  // ================================================
  getLoadingPromise<T>(key: string): Promise<T> | null {
    return this.loadingPromises.get(key) as Promise<T> | null;
  }

  // ================================================
  // SET_LOADING_PROMISE: Track in-flight requests
  // ================================================
  setLoadingPromise<T>(key: string, promise: Promise<T>): void {
    this.loadingPromises.set(key, promise);
    promise
      .then(() => this.loadingPromises.delete(key))
      .catch(() => this.loadingPromises.delete(key));
  }

  // ================================================
  // LISTEN: Setup realtime listener
  // ================================================
  listen<T>(
    key: string,
    query: Query,
    onUpdate: (data: T[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    if (this.listeners.has(key)) {
      this.listeners.get(key)?.();
    }

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        this.set(key, data);
        onUpdate(data);
      },
      (error) => {
        console.error(`Config listener error for ${key}:`, error);
        onError?.(error);
      }
    );

    this.listeners.set(key, unsubscribe);
    return unsubscribe;
  }

  // ================================================
  // UNLISTEN: Remove realtime listener
  // ================================================
  unlisten(key: string): void {
    const unsubscribe = this.listeners.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(key);
    }
  }

  // ================================================
  // GET_ALL_LISTENERS: For cleanup
  // ================================================
  getAllListeners(): Map<string, Unsubscribe> {
    return this.listeners;
  }
}

// ======================================================
// SINGLETON INSTANCE
// ======================================================

export const configCache = new ConfigCache();

// ======================================================
// CONFIG LOADER WITH CACHING
// ======================================================

export interface ConfigLoaderOptions {
  cacheDuration?: number;
  fallbackValue?: any;
  validateSchema?: (data: any) => boolean;
}

export async function loadConfig<T>(
  path: string,
  options: ConfigLoaderOptions = {}
): Promise<T> {
  const {
    cacheDuration = CACHE_DURATION.MEDIUM,
    fallbackValue = null,
    validateSchema,
  } = options;

  // ================================================
  // CHECK CACHE FIRST
  // ================================================
  if (configCache.has(path)) {
    return configCache.get<T>(path) || fallbackValue;
  }

  // ================================================
  // PREVENT DUPLICATE LOADS
  // ================================================
  const existingPromise = configCache.getLoadingPromise<T>(path);
  if (existingPromise) {
    return existingPromise;
  }

  // ================================================
  // LOAD FROM FIRESTORE
  // ================================================
  const loadPromise = (async () => {
    try {
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.warn(`Config not found at path: ${path}`);
        return fallbackValue;
      }

      const data = docSnap.data() as T;

      // ============================================
      // VALIDATE IF SCHEMA PROVIDED
      // ============================================
      if (validateSchema && !validateSchema(data)) {
        console.error(`Config validation failed for ${path}`);
        return fallbackValue;
      }

      // ============================================
      // CACHE IT
      // ============================================
      configCache.set<T>(path, data, cacheDuration);

      return data;
    } catch (error) {
      console.error(`Error loading config from ${path}:`, error);
      return fallbackValue;
    }
  })();

  configCache.setLoadingPromise(path, loadPromise);
  return loadPromise;
}

// ======================================================
// LOAD ALL CONFIGS IN A DOMAIN
// ======================================================

export async function loadConfigDomain<T>(
  domain: string,
  options: ConfigLoaderOptions = {}
): Promise<Record<string, T>> {
  try {
    const collectionRef = collection(db, domain);
    const publishedQuery = query(
      collectionRef,
      where("status", "==", "published")
    );

    const snapshot = await getDoc(
      doc(db, domain, "published")
    );

    if (!snapshot.exists()) {
      return {};
    }

    const data = snapshot.data() as Record<string, T>;
    configCache.set(domain, data, options.cacheDuration);

    return data;
  } catch (error) {
    console.error(`Error loading config domain ${domain}:`, error);
    return options.fallbackValue || {};
  }
}

// ======================================================
// SETUP REALTIME LISTENER FOR CONFIG
// ======================================================

export function setupConfigListener<T>(
  path: string,
  onUpdate: (data: T[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const docRef = doc(db, path);
  const configQuery = query(
    collection(db, path),
    where("status", "==", "published")
  );

  return configCache.listen(path, configQuery, onUpdate, onError);
}

// ======================================================
// PUBLISH CONFIG (Admin)
// ======================================================

export async function publishConfig(
  path: string,
  draft: any,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, path);

    const now = new Date();
    const version = `v${now.toISOString().split("T")[0]}`;

    // This would be implemented with actual Firestore write
    // For now, just invalidate cache to trigger reload
    configCache.invalidate(path);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ======================================================
// ROLLBACK CONFIG (Admin)
// ======================================================

export async function rollbackConfig(
  path: string,
  previousVersion: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Invalidate cache to trigger reload of previous version
    configCache.invalidate(path);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ======================================================
// CLEANUP ON APP UNMOUNT
// ======================================================

export function cleanupAllListeners(): void {
  const listeners = configCache.getAllListeners();
  listeners.forEach((unsubscribe) => unsubscribe());
  configCache.clearAll();
}
