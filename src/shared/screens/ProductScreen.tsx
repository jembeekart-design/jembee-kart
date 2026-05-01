"use client";

import { useState } from "react";
import ReviewCard from "../ui/ReviewCard";
import { getProductReviews } from "../lib/reviews";

type Props = {
  productId: string;
};

export default function ProductScreen({ productId }: Props) {
  const [reviews] = useState(getProductReviews(productId));

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Product Reviews</h1>

      {reviews.length === 0 && (
        <p className="text-gray-400">No reviews yet</p>
      )}

      {reviews.map((review, i) => (
        <ReviewCard key={i} review={review} />
      ))}
    </div>
  );
}



























