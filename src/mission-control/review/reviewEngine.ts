import { generateSuggestions } from "../suggestions/suggestionEngine";
import { getReview } from "./reviewStore";
import type { ReviewItem, ReviewReport } from "./types";

export async function generateReviewReport(): Promise<ReviewReport> {
  const suggestionReport = await generateSuggestions();

  const items: ReviewItem[] = suggestionReport.suggestions.map(
    (item: any) => {
      const saved = getReview(item.id);

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        file: item.file,
        rule: item.rule ?? "",
        severity: item.severity,
        status: saved?.status ?? "pending",
        createdAt: saved?.createdAt ?? Date.now(),
      };
    }
  );

  return {
    total: items.length,
    pending: items.filter(i => i.status === "pending").length,
    approved: items.filter(i => i.status === "approved").length,
    rejected: items.filter(i => i.status === "rejected").length,
    items,
  };
}
