/**
 * JembeeKart MLM Engine Global Configuration
 * Primary Source: Firestore 'adminSettings'
 * Fallback Source: MLM_CONFIG constant
 */

export const ENGINE_VERSION = "4.0.0";

export const MLM_CONFIG = {
  maxWatchRewardLimit: 20,       
  defaultConversionRate: 0.5,    
  defaultRequiredOrders: 5,      
  defaultRewardPoints: 50,       
  maxPendingCycles: 5,           
  minWatchSeconds: 30,
  
  // Is line ko add karna zaroori hai taaki build error hat jaye
  maxReferralLevels: 4 
};
