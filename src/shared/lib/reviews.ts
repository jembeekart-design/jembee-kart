export type Review = {
  productId: string;
  user?: string;
  rating: number;
  comment: string;
  source: "admin" | "user";
};

let reviews: Review[] = [];

export const addUserReview = (review: Review) => {
  review.source = "user";
  reviews.push(review);
};

export const addAdminReview = (review: Review) => {
  review.source = "admin";
  reviews.push(review);
};

export const getProductReviews = (productId: string) => {
  return reviews.filter((r) => r.productId === productId);
};
