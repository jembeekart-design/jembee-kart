// src/jembee-governance/services/governanceIssueService.ts

import { GovernanceViolation } from "../types/governance.types";

export interface GovernanceIssue {
  id: string;
  problem: string;
  fileName: string;
  filePath: string;
  category: string;
  priority: "CRITICAL" | "ERROR" | "WARNING" | "INFO";
  fixSuggestion: string;
  status: "PENDING" | "IN_PROGRESS" | "FIXED";
  detectedAt: string;
}

export class GovernanceIssueService {
  /**
   * Convert scanner violations
   * into governance issues
   */
  public createIssues(
    violations: GovernanceViolation[]
  ): GovernanceIssue[] {
    return violations.map((violation) => ({
      id: violation.id,
      problem: violation.title,
      fileName: this.extractFileName(
        violation.filePath || ""
      ),
      filePath: violation.filePath || "",
      category: violation.category,
      priority: violation.severity,
      fixSuggestion:
        violation.recommendation ||
        "Review and resolve issue.",
      status: "PENDING",
      detectedAt:
        violation.detectedAt ||
        new Date().toISOString(),
    }));
  }

  /**
   * Group issues by priority
   */
  public groupByPriority(
    issues: GovernanceIssue[]
  ) {
    return {
      critical: issues.filter(
        (i) => i.priority === "CRITICAL"
      ),
      error: issues.filter(
        (i) => i.priority === "ERROR"
      ),
      warning: issues.filter(
        (i) => i.priority === "WARNING"
      ),
      info: issues.filter(
        (i) => i.priority === "INFO"
      ),
    };
  }

  /**
   * Count issues
   */
  public getSummary(
    issues: GovernanceIssue[]
  ) {
    return {
      total: issues.length,

      critical: issues.filter(
        (i) => i.priority === "CRITICAL"
      ).length,

      error: issues.filter(
        (i) => i.priority === "ERROR"
      ).length,

      warning: issues.filter(
        (i) => i.priority === "WARNING"
      ).length,

      info: issues.filter(
        (i) => i.priority === "INFO"
      ).length,

      fixed: issues.filter(
        (i) => i.status === "FIXED"
      ).length,

      pending: issues.filter(
        (i) => i.status === "PENDING"
      ).length,
    };
  }

  /**
   * Extract filename
   */
  private extractFileName(
    filePath: string
  ): string {
    if (!filePath) return "unknown";

    const parts = filePath.split(/[\\/]/);

    return parts[parts.length - 1];
  }
}

export const governanceIssueService =
  new GovernanceIssueService();
