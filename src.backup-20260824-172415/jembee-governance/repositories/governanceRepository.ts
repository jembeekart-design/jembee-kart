// src/jembee-governance/repositories/governanceRepository.ts

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

export class GovernanceRepository {
  private readonly COLLECTION =
    "governance_issues";

  async saveIssues(
    violations: any[]
  ): Promise<void> {
    for (const issue of violations) {
      const issueId =
        issue.id +
        "_" +
        Buffer.from(
          issue.filePath || ""
        )
          .toString("base64")
          .replace(/=/g, "");

      await setDoc(
        doc(
          db,
          this.COLLECTION,
          issueId
        ),
        {
          ...issue,

          status: "PENDING",

          priority:
            issue.severity === "CRITICAL"
              ? "HIGH"
              : issue.severity === "ERROR"
              ? "MEDIUM"
              : "LOW",

          createdAt:
            Timestamp.now(),

          updatedAt:
            Timestamp.now(),
        },
        {
          merge: true,
        }
      );
    }
  }

  async getAllIssues() {
    const q = query(
      collection(
        db,
        this.COLLECTION
      ),
      orderBy(
        "createdAt",
        "desc"
      )
    );

    const snapshot =
      await getDocs(q);

    return snapshot.docs.map(
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      })
    );
  }

  async getIssue(
    issueId: string
  ) {
    const snapshot =
      await getDoc(
        doc(
          db,
          this.COLLECTION,
          issueId
        )
      );

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  }

  async updateStatus(
    issueId: string,
    status:
      | "PENDING"
      | "IN_PROGRESS"
      | "FIXED"
  ) {
    await updateDoc(
      doc(
        db,
        this.COLLECTION,
        issueId
      ),
      {
        status,
        updatedAt:
          Timestamp.now(),
      }
    );
  }

  async markFixed(
    issueId: string
  ) {
    return this.updateStatus(
      issueId,
      "FIXED"
    );
  }

  async markInProgress(
    issueId: string
  ) {
    return this.updateStatus(
      issueId,
      "IN_PROGRESS"
    );
  }

  async markPending(
    issueId: string
  ) {
    return this.updateStatus(
      issueId,
      "PENDING"
    );
  }
}

export const governanceRepository =
  new GovernanceRepository();
