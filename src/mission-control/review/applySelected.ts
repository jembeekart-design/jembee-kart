import { previewAstFix } from "../autofix/astAutoFix";
import type { ReviewItem } from "./types";

export interface ApplyResult {
  success: boolean;
  total: number;
  applied: number;
  skipped: number;
}

export async function applySelected(
  items: ReviewItem[]
): Promise<ApplyResult> {
  const approved = items.filter(
    (item) => item.status === "approved"
  );

  if (approved.length === 0) {
    return {
      success: true,
      total: items.length,
      applied: 0,
      skipped: items.length,
    };
  }

  await previewAstFix();

  return {
    success: true,
    total: items.length,
    applied: approved.length,
    skipped: items.length - approved.length,
  };
}
