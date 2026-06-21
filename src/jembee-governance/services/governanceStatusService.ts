// src/jembee-governance/services/governanceStatusService.ts

export type GovernanceIssueStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "FIXED";

export interface GovernanceStatusUpdate {
  issueId: string;
  status: GovernanceIssueStatus;
  updatedAt: string;
  updatedBy?: string;
  note?: string;
}

export class GovernanceStatusService {
  /**
   * Allowed status transitions
   */
  private readonly allowedTransitions: Record<
    GovernanceIssueStatus,
    GovernanceIssueStatus[]
  > = {
    PENDING: ["IN_PROGRESS", "FIXED"],
    IN_PROGRESS: ["FIXED", "PENDING"],
    FIXED: ["PENDING"],
  };

  /**
   * Validate status change
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
   * Create status update record
   */
  public createStatusUpdate(
    issueId: string,
    currentStatus: GovernanceIssueStatus,
    newStatus: GovernanceIssueStatus,
    updatedBy?: string,
    note?: string
  ): GovernanceStatusUpdate {
    if (
      !this.canChangeStatus(
        currentStatus,
        newStatus
      )
    ) {
      throw new Error(
        `Invalid status transition: ${currentStatus} -> ${newStatus}`
      );
    }

    return {
      issueId,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      updatedBy,
      note,
    };
  }

  /**
   * Get status badge color
   */
  public getStatusColor(
    status: GovernanceIssueStatus
  ): string {
    switch (status) {
      case "PENDING":
        return "text-amber-400";

      case "IN_PROGRESS":
        return "text-blue-400";

      case "FIXED":
        return "text-emerald-400";

      default:
        return "text-slate-400";
    }
  }

  /**
   * Get status statistics
   */
  public getStatusSummary(
    statuses: GovernanceIssueStatus[]
  ) {
    return {
      total: statuses.length,

      pending: statuses.filter(
        (s) => s === "PENDING"
      ).length,

      inProgress: statuses.filter(
        (s) => s === "IN_PROGRESS"
      ).length,

      fixed: statuses.filter(
        (s) => s === "FIXED"
      ).length,
    };
  }

  /**
   * Completion percentage
   */
  public getCompletionPercentage(
    statuses: GovernanceIssueStatus[]
  ): number {
    if (!statuses.length) return 100;

    const fixedCount = statuses.filter(
      (s) => s === "FIXED"
    ).length;

    return Math.round(
      (fixedCount / statuses.length) * 100
    );
  }
}

export const governanceStatusService =
  new GovernanceStatusService();
