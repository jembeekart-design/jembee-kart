import {
  getAuth,
} from "firebase/auth";

// ======================================================
// Business Rules Security
// Production Ready
// ======================================================

export type BusinessRulesRole =
  | "OWNER"
  | "SUPER_ADMIN"
  | "SYSTEM_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "VIEWER";

export interface BusinessRulesSecurityReport {

  authenticated: boolean;

  authorized: boolean;

  currentRole: BusinessRulesRole | null;

  allowedRoles: BusinessRulesRole[];

  production: boolean;

  timestamp: string;

}

const WRITE_ROLES: BusinessRulesRole[] = [
  "OWNER",
  "SUPER_ADMIN",
  "SYSTEM_ADMIN",
];

const READ_ROLES: BusinessRulesRole[] = [
  "OWNER",
  "SUPER_ADMIN",
  "SYSTEM_ADMIN",
  "ADMIN",
  "MANAGER",
  "VIEWER",
];

class BusinessRulesSecurityService {

  // ====================================================
  // Authentication
  // ====================================================

  isAuthenticated(): boolean {

    return !!getAuth().currentUser;

  }

  // ====================================================
  // Read Permission
  // ====================================================

  canRead(
    role: BusinessRulesRole
  ): boolean {

    return READ_ROLES.includes(role);

  }

  // ====================================================
  // Write Permission
  // ====================================================

  canWrite(
    role: BusinessRulesRole
  ): boolean {

    return WRITE_ROLES.includes(role);

  }

  // ====================================================
  // Delete Permission
  // ====================================================

  canDelete(
    role: BusinessRulesRole
  ): boolean {

    return role === "OWNER";

  }

  // ====================================================
  // Version Rollback
  // ====================================================

  canRollback(
    role: BusinessRulesRole
  ): boolean {

    return (
      role === "OWNER" ||
      role === "SUPER_ADMIN"
    );

  }

  // ====================================================
  // Environment
  // ====================================================

  isProduction(): boolean {

    return (
      process.env.NODE_ENV ===
      "production"
    );

  }

  // ====================================================
  // Security Report
  // ====================================================

  report(
    role: BusinessRulesRole | null
  ): BusinessRulesSecurityReport {

    return {

      authenticated:
        this.isAuthenticated(),

      authorized:
        role
          ? this.canRead(role)
          : false,

      currentRole: role,

      allowedRoles:
        READ_ROLES,

      production:
        this.isProduction(),

      timestamp:
        new Date().toISOString(),

    };

  }

  // ====================================================
  // Require Authentication
  // ====================================================

  requireAuth(): void {

    if (!this.isAuthenticated()) {

      throw new Error(
        "Authentication required."
      );

    }

  }

  // ====================================================
  // Require Write Access
  // ====================================================

  requireWrite(
    role: BusinessRulesRole
  ): void {

    this.requireAuth();

    if (!this.canWrite(role)) {

      throw new Error(
        "Permission denied."
      );

    }

  }

  // ====================================================
  // Require Rollback Permission
  // ====================================================

  requireRollback(
    role: BusinessRulesRole
  ): void {

    this.requireAuth();

    if (!this.canRollback(role)) {

      throw new Error(
        "Rollback permission denied."
      );

    }

  }

}

export const businessRulesSecurity =
  new BusinessRulesSecurityService();
