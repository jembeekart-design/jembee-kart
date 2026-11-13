export interface TeacherApplicationInput {
  displayName: string;
  qualification: string;
  subjects: string[];
  experienceYears: number;
  bio: string;
}

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export function parseTeacherApplication(value: unknown): TeacherApplicationInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  const displayName = clean(v.displayName, 80);
  const qualification = clean(v.qualification, 120);
  const bio = clean(v.bio, 1000);
  const subjects = Array.isArray(v.subjects)
    ? [...new Set(v.subjects.map((s) => clean(s, 60)).filter(Boolean))].slice(0, 12)
    : [];
  const experienceYears = v.experienceYears;
  if (displayName.length < 2 || qualification.length < 2 || !bio || subjects.length === 0) return null;
  if (typeof experienceYears !== "number" || !Number.isInteger(experienceYears) || experienceYears < 0 || experienceYears > 60) return null;
  return { displayName, qualification, subjects, experienceYears, bio };
}

export function parseTeacherDecision(value: unknown): { uid: string; decision: "verified" | "rejected" | "suspended"; reason?: string } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  const uid = clean(v.uid, 128);
  const decision = v.decision;
  const reason = clean(v.reason, 500);
  if (!uid || !["verified", "rejected", "suspended"].includes(String(decision))) return null;
  if (decision === "rejected" && !reason) return null;
  return { uid, decision: decision as "verified" | "rejected" | "suspended", ...(reason ? { reason } : {}) };
}
