import { governanceConfigService } from "./governanceConfigService";
import { businessRules } from "@/firestore/businessRules";

export interface GovernanceHealthReport {
  healthy: boolean;

  configurationLoaded: boolean;

  businessRulesHealthy: boolean;

  timestamp: string;
}

class GovernanceHealthService {

  /**
   * Complete Health Check
   */
  async check(): Promise<GovernanceHealthReport> {

    let configurationLoaded = false;

    let businessRulesHealthy = false;

    try {

      configurationLoaded =
        await governanceConfigService.validate();

    } catch {

      configurationLoaded = false;

    }

    try {

      businessRulesHealthy =
        await businessRules.isHealthy();

    } catch {

      businessRulesHealthy = false;

    }

    return {

      healthy:
        configurationLoaded &&
        businessRulesHealthy,

      configurationLoaded,

      businessRulesHealthy,

      timestamp:
        new Date().toISOString(),

    };

  }

}

export const governanceHealthService =
  new GovernanceHealthService();
