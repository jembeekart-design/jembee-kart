// src/firestore/businessRules/bootstrap.ts

import { businessRules } from "./service";
import { businessRulesScheduler } from "./scheduler";
import { startBusinessRulesSync } from "./sync";
import { businessRulesMetrics } from "./metrics";

// ======================================================
// Business Rules Bootstrap
// Production Ready
// ======================================================

let initialized = false;

export interface BootstrapResult {
  success: boolean;
  initializedAt: string;
  schedulerRunning: boolean;
  message: string;
}

class BusinessRulesBootstrap {

  /**
   * Initialize Business Rules Engine
   */
  async initialize(): Promise<BootstrapResult> {

    if (initialized) {

      return {
        success: true,
        initializedAt: new Date().toISOString(),
        schedulerRunning:
          businessRulesScheduler.isRunning(),
        message:
          "Business Rules already initialized.",
      };

    }

    try {

      // Load Rules
      await businessRules.getAllRules();

      // Start Firestore Live Sync
      startBusinessRulesSync();

      // Start Auto Refresh Scheduler
      businessRulesScheduler.start();

      initialized = true;

      console.info(
        "[BusinessRules] Bootstrap completed."
      );

      return {

        success: true,

        initializedAt:
          new Date().toISOString(),

        schedulerRunning:
          businessRulesScheduler.isRunning(),

        message:
          "Business Rules initialized successfully.",

      };

    } catch (error) {

      console.error(
        "[BusinessRules] Bootstrap failed",
        error
      );

      return {

        success: false,

        initializedAt:
          new Date().toISOString(),

        schedulerRunning: false,

        message:
          error instanceof Error
            ? error.message
            : "Unknown bootstrap error",

      };

    }

  }

  /**
   * Engine Initialized?
   */
  isInitialized(): boolean {

    return initialized;

  }

  /**
   * Metrics
   */
  getMetrics() {

    return businessRulesMetrics.getMetrics();

  }

  /**
   * Scheduler Status
   */
  getSchedulerStatus() {

    return businessRulesScheduler.getStatus();

  }

}

export const businessRulesBootstrap =
  new BusinessRulesBootstrap();
