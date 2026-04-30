"use client";

import { getProductReviews } from "@/shared/modules/review/reviewService";
import { ReviewCard } from "@/shared/ui/ReviewCard";
import { RatingStars } from "@/shared/ui/RatingStars";

export const ProductScreen = ({ product }: any) => {
  const reviews = getProductReviews(product.id);

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>{product.title}</h2>

      <RatingStars rating={product.rating || 4} />

      <p>₹{product.price}</p>

      <h3>Reviews</h3>

      {reviews.map((r, i) => (
        <ReviewCard key={i} review={r} />
      ))}
    </div>
  );
};