export type ReviewStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface ReviewItem {
  id: string;
  title: string;
  description: string;
  file: string;
  rule: string;
  severity: "critical" | "warning" | "info";
  status: ReviewStatus;
  createdAt: number;
}

export interface ReviewReport {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  items: ReviewItem[];
}
