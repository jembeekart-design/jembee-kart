import {
  businessRulesCache,
} from "./cache";

// ======================================================
// Business Rules Metrics
// Production Ready
// ======================================================

export interface BusinessRulesMetrics {

  totalReads: number;

  cacheHits: number;

  cacheMisses: number;

  firestoreReads: number;

  fallbackReads: number;

  validationFailures: number;

  refreshCount: number;

  lastRefresh: string | null;

  startedAt: string;

}

class BusinessRulesMetricsService {

  private metrics: BusinessRulesMetrics = {

    totalReads: 0,

    cacheHits: 0,

    cacheMisses: 0,

    firestoreReads: 0,

    fallbackReads: 0,

    validationFailures: 0,

    refreshCount: 0,

    lastRefresh: null,

    startedAt: new Date().toISOString(),

  };

  // ====================================================
  // Read Tracking
  // ====================================================

  incrementRead(): void {

    this.metrics.totalReads++;

  }

  incrementCacheHit(): void {

    this.metrics.cacheHits++;

  }

  incrementCacheMiss(): void {

    this.metrics.cacheMisses++;

  }

  incrementFirestoreRead(): void {

    this.metrics.firestoreReads++;

  }

  incrementFallbackRead(): void {

    this.metrics.fallbackReads++;

  }

  incrementValidationFailure(): void {

    this.metrics.validationFailures++;

  }

  incrementRefresh(): void {

    this.metrics.refreshCount++;

    this.metrics.lastRefresh =
      new Date().toISOString();

  }

  // ====================================================
  // Reset
  // ====================================================

  reset(): void {

    this.metrics = {

      totalReads: 0,

      cacheHits: 0,

      cacheMisses: 0,

      firestoreReads: 0,

      fallbackReads: 0,

      validationFailures: 0,

      refreshCount: 0,

      lastRefresh: null,

      startedAt:
        new Date().toISOString(),

    };

  }

  // ====================================================
  // Snapshot
  // ====================================================

  getMetrics(): BusinessRulesMetrics {

    return {

      ...this.metrics,

    };

  }

  // ====================================================
  // Dashboard Report
  // ====================================================

  getReport() {

    const cacheStats =
      businessRulesCache.getStats();

    return {

      ...this.metrics,

      cache: cacheStats,

      uptimeSeconds:
        Math.floor(

          (Date.now() -

            new Date(
              this.metrics.startedAt
            ).getTime()) / 1000

        ),

      generatedAt:
        new Date().toISOString(),

    };

  }

}

export const businessRulesMetrics =
  new BusinessRulesMetricsService();
