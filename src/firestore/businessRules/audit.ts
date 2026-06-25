import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

// ======================================================
// Business Rules Audit
// Production Ready
// ======================================================

export type BusinessRulesAuditAction =
  | "READ"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "ROLLBACK"
  | "CACHE_CLEAR"
  | "SYNC"
  | "VALIDATION"
  | "ERROR";

export interface BusinessRulesAuditRecord {

  action: BusinessRulesAuditAction;

  module: string;

  userId?: string;

  version?: string;

  details?: string;

  metadata?: Record<string, unknown>;

  createdAt?: unknown;

}

const COLLECTION_NAME =
  "business_rules_audit";

// ======================================================
// Service
// ======================================================

class BusinessRulesAuditService {

  /**
   * Write Audit Log
   */
  async log(
    record: BusinessRulesAuditRecord
  ): Promise<void> {

    try {

      await addDoc(

        collection(
          db,
          COLLECTION_NAME
        ),

        {

          ...record,

          createdAt:
            serverTimestamp(),

        }

      );

    } catch (error) {

      console.error(
        "[BusinessRules Audit]",
        error
      );

    }

  }

  /**
   * Config Read
   */
  async logRead(
    module: string,
    userId?: string
  ) {

    return this.log({

      action: "READ",

      module,

      userId,

    });

  }

  /**
   * Config Update
   */
  async logUpdate(

    module: string,

    version: string,

    userId?: string,

    details?: string

  ) {

    return this.log({

      action: "UPDATE",

      module,

      version,

      userId,

      details,

    });

  }

  /**
   * Rollback
   */
  async logRollback(

    version: string,

    userId?: string

  ) {

    return this.log({

      action: "ROLLBACK",

      module: "businessRules",

      version,

      userId,

    });

  }

  /**
   * Validation Error
   */
  async logValidationFailure(

    module: string,

    details: string

  ) {

    return this.log({

      action: "VALIDATION",

      module,

      details,

    });

  }

  /**
   * Runtime Error
   */
  async logError(

    module: string,

    details: string

  ) {

    return this.log({

      action: "ERROR",

      module,

      details,

    });

  }

  /**
   * Cache Clear
   */
  async logCacheClear() {

    return this.log({

      action: "CACHE_CLEAR",

      module: "cache",

    });

  }

  /**
   * Live Sync
   */
  async logSync(

    document: string

  ) {

    return this.log({

      action: "SYNC",

      module: document,

    });

  }

}

export const businessRulesAudit =
  new BusinessRulesAuditService();
