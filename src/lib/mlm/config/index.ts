/**
 * JembeeKart MLM Engine Global Configuration
 * Primary Source: Firestore 'adminSettings'
 * Fallback Source: MLM_CONFIG constant
 */

export const ENGINE_VERSION = "4.0.0";

export const MLM_CONFIG = {
  maxWatchRewardLimit: 20,       // ₹20 cap for margin safety
  defaultConversionRate: 0.5,    // Admin can override in Firestore
  defaultRequiredOrders: 5,      // Ecommerce first condition
  defaultRewardPoints: 50,       // Standard reward
  maxPendingCycles: 5,           // Prevents system abuse
  minWatchSeconds: 30            // Baseline for view validation
};
