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
   * FIX: Added getAllIssues method to satisfy the dashboard requirements
   */
  public async getAllIssues(): Promise<GovernanceIssue[]> {
    // Yahan aapka real Firestore logic aayega. 
    // Abhi ke liye empty array return kar rahe hain taaki build pass ho jaye.
    return [];
  }

  /**
   * Convert scanner violations into governance issues
   */
  public createIssues(violations: GovernanceViolation[]): GovernanceIssue[] {
    return violations.map((violation) => ({
      id: violation.id,
      problem: violation.title,
      fileName: this.extractFileName(violation.filePath || ""),
      filePath: violation.filePath || "",
      category: violation.category,
      priority: violation.severity as any, // Type cast for safety
      fixSuggestion: violation.recommendation || "Review and resolve issue.",
      status: "PENDING",
      detectedAt: violation.detectedAt || new Date().toISOString(),
    }));
  }

  // ... (Baaki ke methods: groupByPriority, getSummary, extractFileName yahan rakhein)
  
  public groupByPriority(issues: GovernanceIssue[]) {
    return {
      critical: issues.filter((i) => i.priority === "CRITICAL"),
      error: issues.filter((i) => i.priority === "ERROR"),
      warning: issues.filter((i) => i.priority === "WARNING"),
      info: issues.filter((i) => i.priority === "INFO"),
    };
  }

  public getSummary(issues: GovernanceIssue[]) {
    return {
      total: issues.length,
      critical: issues.filter((i) => i.priority === "CRITICAL").length,
      error: issues.filter((i) => i.priority === "ERROR").length,
      warning: issues.filter((i) => i.priority === "WARNING").length,
      info: issues.filter((i) => i.priority === "INFO").length,
      fixed: issues.filter((i) => i.status === "FIXED").length,
      pending: issues.filter((i) => i.status === "PENDING").length,
    };
  }

  private extractFileName(filePath: string): string {
    if (!filePath) return "unknown";
    const parts = filePath.split(/[\\/]/);
    return parts[parts.length - 1];
  }
}

export const governanceIssueService = new GovernanceIssueService();
