// ⭐ Review Type
export type Review = {
  productId: string;
  user: string; // required
  rating: number;
  comment: string;
  source: "admin" | "user";
};

// 📦 In-memory storage
let reviews: Review[] = [];

// 👤 Add USER review
export const addUserReview = (review: Review) => {
  review.source = "user";
  reviews.push(review);
};

// 🛠 Add ADMIN review
export const addAdminReview = (review: Review) => {
  review.source = "admin";
  reviews.push(review);
};

// 📋 Get all reviews
export const getProductReviews = (productId: string): Review[] => {
  return reviews.filter((r) => r.productId === productId);
};

// ⭐ Average rating
export const getAverageRating = (productId: string): number => {
  const r = getProductReviews(productId);

  if (!r.length) return 0;

  const total = r.reduce((sum, x) => sum + x.rating, 0);

  return Number((total / r.length).toFixed(1));
};

// 🔀 Mixed reviews
export const getMixedReviews = (productId: string): Review[] => {
  const all = getProductReviews(productId);

  const userReviews = all.filter((r) => r.source === "user");
  const adminReviews = all.filter((r) => r.source === "admin");

  const shuffle = (arr: Review[]) =>
    arr.sort(() => 0.5 - Math.random());

  return shuffle([
    ...userReviews,
    ...adminReviews.slice(0, 2),
  ]);
};
