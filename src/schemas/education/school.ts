/** Pure boundary validation for the school catalog. No Firebase or Next.js imports. */
export const SCHOOL_BOARDS = ["CBSE", "ICSE", "JAC", "BSEB", "OTHER_STATE"] as const;
export type SchoolBoard = (typeof SCHOOL_BOARDS)[number];
export type SchoolStatus = "pending" | "approved" | "rejected";
export type CreateSchoolInput = {
  name: string;
  board: SchoolBoard;
  city: string;
  state: string;
  branch: string | null;
};
export type ReviewSchoolInput = {
  id: string;
  status: "approved" | "rejected";
  reason: string;
};
const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";

export function parseCreateSchool(value: unknown): CreateSchoolInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  const name = clean(body.name, 160);
  const board = clean(body.board, 32);
  const city = clean(body.city, 100);
  const state = clean(body.state, 100);
  const branch = clean(body.branch, 120);
  if (name.length < 2 || !SCHOOL_BOARDS.includes(board as SchoolBoard) || city.length < 2 || state.length < 2) return null;
  return { name, board: board as SchoolBoard, city, state, branch: branch || null };
}

export function parseSchoolReview(value: unknown): ReviewSchoolInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  const id = clean(body.id, 64);
  const status = body.status;
  const reason = clean(body.reason, 500);
  if (!/^[a-f0-9]{64}$/.test(id) || (status !== "approved" && status !== "rejected") || (status === "rejected" && reason.length < 3)) return null;
  return { id, status, reason };
}
