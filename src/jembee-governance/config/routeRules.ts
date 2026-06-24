// src/jembee-governance/config/routeRules.ts

import { 
  GovernancePriority, 
  FeatureCategory 
} from "../types/governance.types";

export interface RouteRule {
  requiredParentRoute: string;
  businessFlow: string;
  businessImpact: string;
  priority: GovernancePriority;
  expectedGovernanceScoreGain: number;
  feature?: FeatureCategory;
}

export const routeRules = {
  // MLM CORE
  "/mlm/dashboard": {
    requiredParentRoute: "/",
    businessFlow: "Home → MLM Dashboard",
    businessImpact: "Referral Control Center",
    priority: "CRITICAL",
    expectedGovernanceScoreGain: 10,
    feature: "REFERRAL",
  },

  "/mlm/wallet": {
    requiredParentRoute: "/mlm/dashboard",
    businessFlow: "Dashboard → Wallet",
    businessImpact: "Commission & Reward Management",
    priority: "CRITICAL",
    expectedGovernanceScoreGain: 8,
    feature: "REFERRAL",
  },

  "/mlm/orders": {
    requiredParentRoute: "/mlm/dashboard",
    businessFlow: "Dashboard → Orders",
    businessImpact: "Revenue Tracking",
    priority: "CRITICAL",
    expectedGovernanceScoreGain: 8,
    feature: "ECOMMERCE",
  },

  "/mlm/team-business": {
    requiredParentRoute: "/mlm/dashboard",
    businessFlow: "Dashboard → Team Business",
    businessImpact: "Team Growth Monitoring",
    priority: "HIGH",
    expectedGovernanceScoreGain: 5,
    feature: "REFERRAL",
  },

  "/mlm/support": {
    requiredParentRoute: "/mlm/dashboard",
    businessFlow: "Dashboard → Support",
    businessImpact: "Customer Resolution",
    priority: "MEDIUM",
    expectedGovernanceScoreGain: 3,
    feature: "ECOMMERCE",
  },

  "/mlm/watch-earn/upload": {
    requiredParentRoute: "/mlm/watch-earn",
    businessFlow: "Watch Earn → Upload",
    businessImpact: "Creator Economy Content Ingestion",
    priority: "CRITICAL",
    expectedGovernanceScoreGain: 15,
    feature: "WATCH_EARN",
  },
} satisfies Record<string, RouteRule>;
