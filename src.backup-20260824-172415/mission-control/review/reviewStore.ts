import type { ReviewItem } from "./types";

const store = new Map<string, ReviewItem>();

export function getReview(id: string) {
  return store.get(id);
}

export function saveReview(item: ReviewItem) {
  store.set(item.id, item);
}

export function getAllReviews() {
  return Array.from(store.values());
}
