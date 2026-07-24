import { hardAutoFix } from "../autofix/hardAutoFix";
import { saveReview } from "./reviewStore";
import type { ReviewItem } from "./types";

export async function applySelected(items: ReviewItem[]) {
  const approved = items.filter(item => item.status === "approved");

  if (approved.length === 0) {
    return {
      success: true,
      applied: 0,
      skipped: items.length,
      message: "No approved items found.",
    };
  }

  const result = await hardAutoFix(approved);

  if (result.success) {
    approved.forEach(item => {
      saveReview({
        ...item,
        status: "applied",
      });
    });
  }

  return {
    success: result.success,
    applied: result.fixed,
    skipped: items.length - approved.length,
    total: items.length,
    message: result.success
      ? "Approved items applied successfully."
      : "Hard Auto Fix failed.",
  };
}
