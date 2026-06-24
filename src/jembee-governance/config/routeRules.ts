// src/jembee-governance/config/routeRules.ts

import { GovernancePriority } from "../types/governance.types";

export interface RouteRule {
requiredParentRoute?: string;
businessFlow: string;
businessImpact: string;
priority: GovernancePriority;
expectedGovernanceScoreGain: number;
}

export const routeRules: Record<string, RouteRule> = {
// ==================================================
// ECOMMERCE FLOW
// ==================================================

"/cart": {
requiredParentRoute: "/",
businessFlow: "Home → Product → Cart",
businessImpact: "Customer Purchase Journey",
priority: "CRITICAL",
expectedGovernanceScoreGain: 8,
},

"/checkout": {
requiredParentRoute: "/cart",
businessFlow: "Cart → Checkout → Order Success",
businessImpact: "Revenue Generation",
priority: "CRITICAL",
expectedGovernanceScoreGain: 10,
},

"/order-success": {
requiredParentRoute: "/checkout",
businessFlow: "Checkout → Order Success",
businessImpact: "Order Completion",
priority: "CRITICAL",
expectedGovernanceScoreGain: 8,
},

// ==================================================
// ACCOUNT FLOW
// ==================================================

"/account": {
requiredParentRoute: "/",
businessFlow: "Home → Account",
businessImpact: "User Management",
priority: "HIGH",
expectedGovernanceScoreGain: 5,
},

"/account/address": {
requiredParentRoute: "/account",
businessFlow: "Account → Address",
businessImpact: "Shipping Management",
priority: "HIGH",
expectedGovernanceScoreGain: 5,
},

// ==================================================
// WATCH & EARN FLOW
// ==================================================

"/mlm/watch-earn": {
requiredParentRoute: "/mlm/dashboard",
businessFlow: "Dashboard → Watch Earn",
businessImpact: "Retention Engine",
priority: "HIGH",
expectedGovernanceScoreGain: 6,
},

"/mlm/watch-earn/upload": {
requiredParentRoute: "/mlm/watch-earn",
businessFlow: "Watch Earn → Upload",
businessImpact: "Creator Growth",
priority: "HIGH",
expectedGovernanceScoreGain: 6,
},

// ==================================================
// REFERRAL FLOW
// ==================================================

"/mlm/network": {
requiredParentRoute: "/mlm/dashboard",
businessFlow: "Dashboard → Network",
businessImpact: "Referral Growth",
priority: "HIGH",
expectedGovernanceScoreGain: 5,
},

"/mlm/ranks": {
requiredParentRoute: "/mlm/dashboard",
businessFlow: "Dashboard → Rank System",
businessImpact: "Referral Motivation",
priority: "MEDIUM",
expectedGovernanceScoreGain: 4,
},
};
