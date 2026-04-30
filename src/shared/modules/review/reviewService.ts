type Review = {
  productId: string;
  user?: string;
  rating: number;
  comment: string;
  source: "admin" | "user";
};

let reviews: Review[] = [];

/* =========================================================
   ✍️ ADD REVIEW (USER)
========================================================= */

export const addUserReview = (review: Review) => {
  review.source = "user";
  reviews.push(review);
};

/* =========================================================
   🛠️ ADMIN REVIEW (QIKINK + FAKE)
========================================================= */

export const addAdminReview = (review: Review) => {
  review.source = "admin";
  reviews.push(review);
};

/* =========================================================
   📊 GET REVIEWS
========================================================= */

export const getProductReviews = (productId: string) => {
  return reviews.filter((r) => r.productId === productId);
};

/* =========================================================
   ⭐ AVG RATING
========================================================= */

export const getAverageRating = (productId: string) => {
  const r = getProductReviews(productId);

  if (!r.length) return 0;

  const total = r.reduce((sum, x) => sum + x.rating, 0);

  return (total / r.length).toFixed(1);
};