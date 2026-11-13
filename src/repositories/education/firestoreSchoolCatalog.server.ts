import "server-only";
import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/admin";
import type { CreateSchoolInput, ReviewSchoolInput } from "@/schemas/education/school";
import type { SchoolCatalogRepository } from "@/modules/education/schools";

/** Keeps the existing educationSchools and educationSchoolAuditLogs contracts intact. */
export const firestoreSchoolCatalog: SchoolCatalogRepository = {
  async createPending(input: CreateSchoolInput, adminUid: string) {
    const normalized = [input.board, input.name, input.branch || "", input.city, input.state].join("|").toLocaleLowerCase("en-IN");
    const id = createHash("sha256").update(normalized).digest("hex");
    const db = getAdminDb();
    const ref = db.collection("educationSchools").doc(id);
    const created = await db.runTransaction(async (tx) => {
      const existing = await tx.get(ref);
      if (existing.exists) return false;
      tx.create(ref, {
        ...input,
        status: "pending",
        createdBy: adminUid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return true;
    });
    return { id, created };
  },

  async review(input: ReviewSchoolInput, adminUid: string) {
    const db = getAdminDb();
    const ref = db.collection("educationSchools").doc(input.id);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error("NOT_FOUND");
      tx.update(ref, {
        status: input.status,
        reviewReason: input.reason || null,
        reviewedBy: adminUid,
        reviewedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      tx.create(db.collection("educationSchoolAuditLogs").doc(), {
        schoolId: input.id,
        action: input.status,
        reason: input.reason || null,
        adminUid,
        createdAt: FieldValue.serverTimestamp(),
      });
    });
  },
};
