import {
  doc,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";

import { db } from "../firebase";

import {
  BUSINESS_RULES_COLLECTION,
  BUSINESS_RULE_DOCUMENTS,
} from "./defaults";

import { businessRulesCache } from "./cache";

// ======================================================
// JembeeKart Business Rules Live Sync
// Production Ready
// ======================================================

class BusinessRulesSyncService {

  private listeners: Unsubscribe[] = [];

  private started = false;

  // ====================================================
  // Start Live Sync
  // ====================================================

  start(): void {

    if (this.started) {
      return;
    }

    this.started = true;

    const documents = Object.values(
      BUSINESS_RULE_DOCUMENTS
    );

    for (const documentId of documents) {

      const unsubscribe = onSnapshot(

        doc(
          db,
          BUSINESS_RULES_COLLECTION,
          documentId
        ),

        () => {

          businessRulesCache.delete(
            documentId
          );

          console.info(
            `[BusinessRules] ${documentId} updated`
          );

        },

        (error) => {

          console.error(
            `[BusinessRules] ${documentId} sync failed`,
            error
          );

        }

      );

      this.listeners.push(
        unsubscribe
      );
    }

    console.info(
      "[BusinessRules] Live Sync Started"
    );

  }

  // ====================================================
  // Stop Live Sync
  // ====================================================

  stop(): void {

    this.listeners.forEach(
      (unsubscribe) => unsubscribe()
    );

    this.listeners = [];

    this.started = false;

    console.info(
      "[BusinessRules] Live Sync Stopped"
    );

  }

  // ====================================================
  // Restart
  // ====================================================

  restart(): void {

    this.stop();

    this.start();

  }

  // ====================================================
  // Status
  // ====================================================

  isRunning(): boolean {

    return this.started;

  }

  // ====================================================
  // Listener Count
  // ====================================================

  getListenerCount(): number {

    return this.listeners.length;

  }

  // ====================================================
  // Health
  // ====================================================

  getHealthReport() {

    return {

      running: this.started,

      activeListeners:
        this.listeners.length,

      timestamp:
        new Date().toISOString(),

    };

  }

}

// ======================================================
// Singleton Export
// ======================================================

export const businessRulesSync =
  new BusinessRulesSyncService();
