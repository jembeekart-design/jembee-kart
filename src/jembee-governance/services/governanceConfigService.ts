// src/jembee-governance/services/governanceConfigService.ts

import { profitabilityConfigService } from "./profitabilityConfigService";
import { watchEarnConfigService } from "./watchEarnConfigService";
import { mlmConfigService } from "./mlmConfigService";
import { walletConfigService } from "./walletConfigService";
import { creatorEconomyConfigService } from "./creatorEconomyConfigService";
import { featureFlagService } from "./featureFlagService";

export interface GovernanceConfiguration {
  profitability: Awaited<
    ReturnType<typeof profitabilityConfigService.getRules>
  >;

  watchEarn: Awaited<
    ReturnType<typeof watchEarnConfigService.getRules>
  >;

  mlm: Awaited<
    ReturnType<typeof mlmConfigService.getRules>
  >;

  wallet: Awaited<
    ReturnType<typeof walletConfigService.getRules>
  >;

  creatorEconomy: Awaited<
    ReturnType<typeof creatorEconomyConfigService.getRules>
  >;

  featureFlags: Awaited<
    ReturnType<typeof featureFlagService.getFlags>
  >;
}

class GovernanceConfigService {

  /**
   * Load Complete Governance Configuration
   */
  async getConfiguration(): Promise<GovernanceConfiguration> {

    const [
      profitability,
      watchEarn,
      mlm,
      wallet,
      creatorEconomy,
      featureFlags,
    ] = await Promise.all([

      profitabilityConfigService.getRules(),

      watchEarnConfigService.getRules(),

      mlmConfigService.getRules(),

      walletConfigService.getRules(),

      creatorEconomyConfigService.getRules(),

      featureFlagService.getFlags(),

    ]);

    return {
      profitability,
      watchEarn,
      mlm,
      wallet,
      creatorEconomy,
      featureFlags,
    };

  }

  /**
   * Validate All Configuration
   */
  async validate(): Promise<boolean> {

    const checks = await Promise.all([

      profitabilityConfigService.health(),

      watchEarnConfigService.health(),

      mlmConfigService.health(),

      walletConfigService.health(),

      creatorEconomyConfigService.health(),

      featureFlagService.health(),

    ]);

    return checks.every(Boolean);

  }

  /**
   * Refresh All Cached Configuration
   */
  refresh(): void {

    profitabilityConfigService.refresh();

    watchEarnConfigService.refresh();

    mlmConfigService.refresh();

    walletConfigService.refresh();

    creatorEconomyConfigService.refresh();

    featureFlagService.refresh();

  }

}

export const governanceConfigService =
  new GovernanceConfigService();
