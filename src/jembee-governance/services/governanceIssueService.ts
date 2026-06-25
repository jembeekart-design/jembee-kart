// ======================================================
// src/jembee-governance/services/governanceIssueService.ts
// PART 1
// IMPORTS + TYPES + FIRESTORE SETUP
// ======================================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp,
  Timestamp,
  DocumentData,
} from "firebase/firestore";

import { db } from "../../firebase/config";

import {
  GovernanceViolation,
} from "../types/governance.types";

// ======================================================
// COLLECTION
// ======================================================

const COLLECTION_NAME =
  "governance_issues";

// ======================================================
// ISSUE STATUS
// ======================================================

export type GovernanceIssueStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "FIXED";

// ======================================================
// PRIORITY
// ======================================================

export type GovernanceIssuePriority =
  | "CRITICAL"
  | "ERROR"
  | "WARNING"
  | "INFO";

// ======================================================
// GOVERNANCE ISSUE
// ======================================================

export interface GovernanceIssue {

  id: string;

  problem: string;

  fileName: string;

  filePath: string;

  category: string;

  priority:
    GovernanceIssuePriority;

  fixSuggestion: string;

  status:
    GovernanceIssueStatus;

  detectedAt: string;

  createdAt?: string;

  updatedAt?: string;

  fixedAt?: string;

  assignedTo?: string;

  scanner?: string;

  metadata?: Record<
    string,
    unknown
  >;

}

// ======================================================
// SUMMARY
// ======================================================

export interface GovernanceIssueSummary {

  total: number;

  critical: number;

  error: number;

  warning: number;

  info: number;

  pending: number;

  inProgress: number;

  fixed: number;

}

// ======================================================
// FILTER
// ======================================================

export interface GovernanceIssueFilter {

  priority?:
    GovernanceIssuePriority;

  status?:
    GovernanceIssueStatus;

  category?: string;

  fileName?: string;

}

// ======================================================
// SERVICE
// ======================================================

export class GovernanceIssueService {

  private readonly collection =
    collection(
      db,
      COLLECTION_NAME
    );
  // ======================================================
// PART 2
// CRUD METHODS
// ======================================================

/**
 * Get All Issues
 */
public async getAllIssues(): Promise<GovernanceIssue[]> {

  const q = query(
    this.collection,
    orderBy("detectedAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => {

    const data =
      document.data() as DocumentData;

    return {

      id: document.id,

      problem:
        data.problem ?? "",

      fileName:
        data.fileName ?? "",

      filePath:
        data.filePath ?? "",

      category:
        data.category ?? "",

      priority:
        data.priority ?? "INFO",

      fixSuggestion:
        data.fixSuggestion ??
        "",

      status:
        data.status ??
        "PENDING",

      detectedAt:
        data.detectedAt ??
        new Date().toISOString(),

      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt
              .toDate()
              .toISOString()
          : data.createdAt,

      updatedAt:
        data.updatedAt instanceof Timestamp
          ? data.updatedAt
              .toDate()
              .toISOString()
          : data.updatedAt,

      fixedAt:
        data.fixedAt instanceof Timestamp
          ? data.fixedAt
              .toDate()
              .toISOString()
          : data.fixedAt,

      assignedTo:
        data.assignedTo,

      scanner:
        data.scanner,

      metadata:
        data.metadata,

    };

  });

}

/**
 * Get Issue By Id
 */
public async getIssueById(
  issueId: string
): Promise<
  GovernanceIssue | null
> {

  const reference =
    doc(
      db,
      COLLECTION_NAME,
      issueId
    );

  const snapshot =
    await getDoc(reference);

  if (!snapshot.exists()) {
    return null;
  }

  const data =
    snapshot.data();

  return {

    id: snapshot.id,

    problem:
      data.problem,

    fileName:
      data.fileName,

    filePath:
      data.filePath,

    category:
      data.category,

    priority:
      data.priority,

    fixSuggestion:
      data.fixSuggestion,

    status:
      data.status,

    detectedAt:
      data.detectedAt,

    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt
            .toDate()
            .toISOString()
        : data.createdAt,

    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt
            .toDate()
            .toISOString()
        : data.updatedAt,

    fixedAt:
      data.fixedAt instanceof Timestamp
        ? data.fixedAt
            .toDate()
            .toISOString()
        : data.fixedAt,

    assignedTo:
      data.assignedTo,

    scanner:
      data.scanner,

    metadata:
      data.metadata,

  };

}

/**
 * Create Issue
 */
public async createIssue(
  issue: GovernanceIssue
): Promise<string> {

  const reference =
    await addDoc(
      this.collection,
      {

        ...issue,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),

      }
    );

  return reference.id;

}

/**
 * Bulk Create Issues
 */
public async createIssues(
  violations:
    GovernanceViolation[]
): Promise<void> {

  if (
    violations.length === 0
  ) {
    return;
  }

  const batch =
    writeBatch(db);

  violations.forEach(
    (violation) => {

      const reference =
        doc(this.collection);

      batch.set(
        reference,
        {

          problem:
            violation.title,

          fileName:
            this.extractFileName(
              violation.filePath ??
                ""
            ),

          filePath:
            violation.filePath ??
            "",

          category:
            violation.category,

          priority:
            violation.severity,

          fixSuggestion:
            violation.recommendation ??
            "",

          status:
            "PENDING",

          detectedAt:
            violation.detectedAt,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),

        }
      );

    }
  );

  await batch.commit();

}
  // ======================================================
// PART 3
// UPDATE • DELETE • SUMMARY • UTILITIES
// ======================================================

/**
 * Update Issue
 */
public async updateIssue(
  issueId: string,
  updates: Partial<GovernanceIssue>
): Promise<void> {

  const reference = doc(
    db,
    COLLECTION_NAME,
    issueId
  );

  await updateDoc(reference, {
    ...updates,
    updatedAt: serverTimestamp(),
  });

}

/**
 * Delete Issue
 */
public async deleteIssue(
  issueId: string
): Promise<void> {

  const reference = doc(
    db,
    COLLECTION_NAME,
    issueId
  );

  await deleteDoc(reference);

}

/**
 * Change Issue Status
 */
public async updateStatus(
  issueId: string,
  status: GovernanceIssueStatus
): Promise<void> {

  const reference = doc(
    db,
    COLLECTION_NAME,
    issueId
  );

  await updateDoc(reference, {

    status,

    updatedAt:
      serverTimestamp(),

    ...(status === "FIXED"
      ? {
          fixedAt:
            serverTimestamp(),
        }
      : {}),

  });

}

/**
 * Group By Priority
 */
public groupByPriority(
  issues: GovernanceIssue[]
) {

  return {

    critical:
      issues.filter(
        (i) =>
          i.priority ===
          "CRITICAL"
      ),

    error:
      issues.filter(
        (i) =>
          i.priority ===
          "ERROR"
      ),

    warning:
      issues.filter(
        (i) =>
          i.priority ===
          "WARNING"
      ),

    info:
      issues.filter(
        (i) =>
          i.priority ===
          "INFO"
      ),

  };

}

/**
 * Summary
 */
public getSummary(
  issues: GovernanceIssue[]
): GovernanceIssueSummary {

  return {

    total:
      issues.length,

    critical:
      issues.filter(
        (i) =>
          i.priority ===
          "CRITICAL"
      ).length,

    error:
      issues.filter(
        (i) =>
          i.priority ===
          "ERROR"
      ).length,

    warning:
      issues.filter(
        (i) =>
          i.priority ===
          "WARNING"
      ).length,

    info:
      issues.filter(
        (i) =>
          i.priority ===
          "INFO"
      ).length,

    pending:
      issues.filter(
        (i) =>
          i.status ===
          "PENDING"
      ).length,

    inProgress:
      issues.filter(
        (i) =>
          i.status ===
          "IN_PROGRESS"
      ).length,

    fixed:
      issues.filter(
        (i) =>
          i.status ===
          "FIXED"
      ).length,

  };

}

/**
 * Search
 */
public search(
  issues: GovernanceIssue[],
  keyword: string
): GovernanceIssue[] {

  const search =
    keyword.toLowerCase();

  return issues.filter(
    (issue) =>

      issue.problem
        .toLowerCase()
        .includes(search) ||

      issue.fileName
        .toLowerCase()
        .includes(search) ||

      issue.category
        .toLowerCase()
        .includes(search)

  );

}

/**
 * Filter
 */
public filter(
  issues: GovernanceIssue[],
  filter: GovernanceIssueFilter
): GovernanceIssue[] {

  return issues.filter(
    (issue) => {

      if (
        filter.priority &&
        issue.priority !==
          filter.priority
      ) {
        return false;
      }

      if (
        filter.status &&
        issue.status !==
          filter.status
      ) {
        return false;
      }

      if (
        filter.category &&
        issue.category !==
          filter.category
      ) {
        return false;
      }

      if (
        filter.fileName &&
        issue.fileName !==
          filter.fileName
      ) {
        return false;
      }

      return true;

    }
  );

}

/**
 * Extract File Name
 */
private extractFileName(
  filePath: string
): string {

  if (!filePath) {
    return "unknown";
  }

  const parts =
    filePath.split(/[\\/]/);

  return (
    parts[
      parts.length - 1
    ] ?? "unknown"
  );

}

}

// ======================================================
// SINGLETON
// ======================================================

export const governanceIssueService =
  new GovernanceIssueService();
