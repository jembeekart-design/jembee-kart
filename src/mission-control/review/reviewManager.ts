import { generateReviewReport } from "./reviewEngine";
import type { ReviewItem, ReviewReport } from "./types";

export class ReviewManager {
  async getReport(): Promise<ReviewReport> {
    return generateReviewReport();
  }

  approve(item: ReviewItem): ReviewItem {
    return {
      ...item,
      status: "approved",
    };
  }

  reject(item: ReviewItem): ReviewItem {
    return {
      ...item,
      status: "rejected",
    };
  }
}

export const reviewManager = new ReviewManager();
