import { applyAstFix } from "./astAutoFix";
import type { ReviewItem } from "../review/types";

export interface HardAutoFixResult {
  success: boolean;
  total: number;
  fixed: number;
  skipped: number;
}

export async function hardAutoFix(
  items: ReviewItem[]
): Promise<HardAutoFixResult> {
  const approved = items.filter(
    (item) => item.status === "approved"
  );

  if (approved.length === 0) {
    return {
      success: true,
      total: items.length,
      fixed: 0,
      skipped: items.length,
    };
  }

  await applyAstFix();

  return {
    success: true,
    total: items.length,
    fixed: approved.length,
    skipped: items.length - approved.length,
  };
}
