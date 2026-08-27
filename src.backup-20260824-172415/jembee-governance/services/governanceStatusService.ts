// src/jembee-governance/services/governanceStatusService.ts

import {
  GovernanceViolation,
} from "../types/governance.types";

// ======================================================
// GOVERNANCE ISSUE STATUS
// ======================================================

export type GovernanceIssueStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "FIXED";

// ======================================================
// STATUS UPDATE
// ======================================================

export interface GovernanceStatusUpdate {

  issueId: string;

  status: GovernanceIssueStatus;

  updatedAt: string;

  updatedBy?: string;

  note?: string;

}

// ======================================================
// DASHBOARD STATS
// ======================================================

export interface DashboardStats {

  totalIssues: number;

  criticalIssues: number;

  warningIssues: number;

  errorIssues: number;

  infoIssues: number;

  passedModules: number;

  failedModules: number;

  governanceScore: number;

}

// ======================================================
// STATUS SUMMARY
// ======================================================

export interface GovernanceStatusSummary {

  total: number;

  pending: number;

  inProgress: number;

  fixed: number;

  completionPercentage: number;

}

// ======================================================
// GOVERNANCE STATUS SERVICE
// ======================================================

export class GovernanceStatusService {

  /**
   * Allowed Status Flow
   */
  private readonly allowedTransitions:
    Record<
      GovernanceIssueStatus,
      GovernanceIssueStatus[]
    > = {

      PENDING: [
        "IN_PROGRESS",
        "FIXED",
      ],

      IN_PROGRESS: [
        "FIXED",
        "PENDING",
      ],

      FIXED: [
        "PENDING",
      ],

    };

  /**
   * Local Cache
   */
  private cache:
    DashboardStats | null = null;

  private lastRefresh = 0;

  private readonly CACHE_DURATION =
    60 * 1000;

  // ====================================================
  // PART 2 STARTS HERE
  // ====================================================
    /**
   * Get Dashboard Statistics
   *
   * Phase 1:
   * Local aggregation
   *
   * Phase 2:
   * Firestore aggregation
   *
   * Phase 3:
   * Analytics aggregation
   */
  public async getDashboardStats(): Promise<DashboardStats> {

    /**
     * Cache
     */
    if (
      this.cache &&
      Date.now() - this.lastRefresh <
        this.CACHE_DURATION
    ) {
      return this.cache;
    }

    const violations: GovernanceViolation[] = [];

    const criticalIssues =
      violations.filter(
        (v) =>
          v.severity === "CRITICAL"
      ).length;

    const errorIssues =
      violations.filter(
        (v) =>
          v.severity === "ERROR"
      ).length;

    const warningIssues =
      violations.filter(
        (v) =>
          v.severity === "WARNING"
      ).length;

    const infoIssues =
      violations.filter(
        (v) =>
          v.severity === "INFO"
      ).length;

    const failedModules =
      criticalIssues + errorIssues;

    const passedModules =
      Math.max(
        0,
        100 - failedModules
      );

    const governanceScore =
      Math.max(
        0,
        100 -
          (
            criticalIssues * 10 +
            errorIssues * 5 +
            warningIssues * 2
          )
      );

    const stats: DashboardStats = {

      totalIssues:
        violations.length,

      criticalIssues,

      warningIssues,

      errorIssues,

      infoIssues,

      passedModules,

      failedModules,

      governanceScore,

    };

    this.cache = stats;

    this.lastRefresh = Date.now();

    return stats;

  }

  // ====================================================
  // PART 3 STARTS HERE
  // ====================================================
  /**
   * Check whether a status transition is allowed.
   */
  public canChangeStatus(
    currentStatus: GovernanceIssueStatus,
    newStatus: GovernanceIssueStatus
  ): boolean {

    return this.allowedTransitions[
      currentStatus
    ].includes(newStatus);

  }

  /**
   * Validate Status Transition
   */
  public validateTransition(
    currentStatus: GovernanceIssueStatus,
    newStatus: GovernanceIssueStatus
  ): void {

    if (
      !this.canChangeStatus(
        currentStatus,
        newStatus
      )
    ) {

      throw new Error(

        `Invalid Governance Status Transition: ${currentStatus} → ${newStatus}`

      );

    }

  }

  /**
   * Create Status Update Object
   */
  public updateStatus(
    issueId: string,
    currentStatus: GovernanceIssueStatus,
    newStatus: GovernanceIssueStatus,
    updatedBy?: string,
    note?: string
  ): GovernanceStatusUpdate {

    this.validateTransition(
      currentStatus,
      newStatus
    );

    return {

      issueId,

      status: newStatus,

      updatedAt:
        new Date().toISOString(),

      updatedBy,

      note,

    };

  }

  // ====================================================
  // PART 4 STARTS HERE
  // ====================================================
    /**
   * Get Status Summary
   */
  public getStatusSummary(
    statuses: GovernanceIssueStatus[]
  ): GovernanceStatusSummary {

    const pending =
      statuses.filter(
        (status) =>
          status === "PENDING"
      ).length;

    const inProgress =
      statuses.filter(
        (status) =>
          status === "IN_PROGRESS"
      ).length;

    const fixed =
      statuses.filter(
        (status) =>
          status === "FIXED"
      ).length;

    return {

      total:
        statuses.length,

      pending,

      inProgress,

      fixed,

      completionPercentage:
        this.getCompletionPercentage(
          statuses
        ),

    };

  }

  /**
   * Get Pending Issues Count
   */
  public getPendingCount(
    statuses: GovernanceIssueStatus[]
  ): number {

    return statuses.filter(
      (status) =>
        status === "PENDING"
    ).length;

  }

  /**
   * Get In Progress Count
   */
  public getInProgressCount(
    statuses: GovernanceIssueStatus[]
  ): number {

    return statuses.filter(
      (status) =>
        status === "IN_PROGRESS"
    ).length;

  }

  /**
   * Get Fixed Count
   */
  public getFixedCount(
    statuses: GovernanceIssueStatus[]
  ): number {

    return statuses.filter(
      (status) =>
        status === "FIXED"
    ).length;

  }

  // ====================================================
  // PART 5 STARTS HERE
  // ====================================================
    /**
   * Calculate Completion Percentage
   */
  public getCompletionPercentage(
    statuses: GovernanceIssueStatus[]
  ): number {

    if (statuses.length === 0) {
      return 100;
    }

    const fixedCount =
      this.getFixedCount(
        statuses
      );

    return Math.round(
      (fixedCount / statuses.length) * 100
    );

  }

  /**
   * Check Whether All Issues Are Fixed
   */
  public isCompleted(
    statuses: GovernanceIssueStatus[]
  ): boolean {

    return statuses.every(
      (status) =>
        status === "FIXED"
    );

  }

  /**
   * Clear Cached Dashboard Statistics
   */
  public clearCache(): void {

    this.cache = null;

    this.lastRefresh = 0;

  }

  /**
   * Force Dashboard Refresh
   */
  public async refreshDashboardStats(): Promise<DashboardStats> {

    this.clearCache();

    return this.getDashboardStats();

  }

  /**
   * Cache Status
   */
  public isCacheValid(): boolean {

    if (!this.cache) {
      return false;
    }

    return (
      Date.now() - this.lastRefresh <
      this.CACHE_DURATION
    );

  }

  // ====================================================
  // PART 6 STARTS HERE
  // ====================================================
    /**
   * Get Last Dashboard Refresh Time
   */
  public getLastRefreshTime():
    string | null {

    if (this.lastRefresh === 0) {
      return null;
    }

    return new Date(
      this.lastRefresh
    ).toISOString();

  }

  /**
   * Get Current Cache
   */
  public getCachedStats():
    DashboardStats | null {

    return this.cache;

  }

  /**
   * Health Check
   */
  public health() {

    return {

      healthy: true,

      cacheLoaded:
        this.cache !== null,

      cacheValid:
        this.isCacheValid(),

      lastRefresh:
        this.getLastRefreshTime(),

    };

  }

  /**
   * Reset Service
   */
  public reset(): void {

    this.clearCache();

  }

}

// ======================================================
// SINGLETON EXPORT
// ======================================================

export const governanceStatusService =
  new GovernanceStatusService();
