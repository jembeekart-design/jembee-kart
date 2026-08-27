/**
 * Control Tower Service
 * 
 * Fetches governance reports from server-side API endpoint.
 * No direct imports of governanceEngine to keep this safe for client use.
 */

export interface ControlTowerReport {
  total: number;
  critical: number;
  warning: number;
  info: number;
  issues: any[];
  deploymentStatus?: string;
  overallScore?: number;
  generatedAt?: string;
}

export async function getControlTowerReport(): Promise<ControlTowerReport> {
  try {
    const response = await fetch("/api/governance/report", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Disable cache to always get fresh report
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Governance API error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to generate governance report");
    }

    return result.data;
  } catch (error) {
    console.error("[Control Tower Service Error]", error);
    // Return fallback report on error
    return {
      total: 0,
      critical: 0,
      warning: 0,
      info: 0,
      issues: [],
      deploymentStatus: "ERROR",
    };
  }
}
