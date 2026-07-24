import { generateReviewReport } from "./reviewEngine";
import { saveReview } from "./reviewStore";
import type { ReviewItem, ReviewReport } from "./types";

export class ReviewManager {
  async getReport(): Promise<ReviewReport> {
    return generateReviewReport();
  }

  approve(item: ReviewItem): ReviewItem {
    const updated: ReviewItem = {
      ...item,
      status: "approved",
    };

    saveReview(updated);
    return updated;
  }

  reject(item: ReviewItem): ReviewItem {
    const updated: ReviewItem = {
      ...item,
      status: "rejected",
    };

    saveReview(updated);
    return updated;
  }
}

export const reviewManager = new ReviewManager();
