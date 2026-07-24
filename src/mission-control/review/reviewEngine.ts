import { generateSuggestions } from "../suggestions/suggestionEngine";
import type { ReviewItem, ReviewReport } from "./types";

export async function generateReviewReport(): Promise<ReviewReport> {
  const suggestionReport = await generateSuggestions();

  const items: ReviewItem[] = suggestionReport.suggestions.map(
    (item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      file: item.file,
      rule: item.rule ?? "",
      severity: item.severity,
      status: "pending",
      createdAt: Date.now(),
    })
  );

  return {
    total: items.length,
    pending: items.length,
    approved: 0,
    rejected: 0,
    items,
  };
}
