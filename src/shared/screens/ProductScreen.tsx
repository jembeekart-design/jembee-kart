"use client";

import React from "react";
import { getProductReviews } from "@/shared/ui/ReviewCard";
import ReviewCard from "@/shared/ui/ReviewCard";

type Props = {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
    description?: string;
  };
};

export const ProductScreen = ({ product }: Props) => {
  const reviews = getProductReviews(product.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">

      {/* ================= PRODUCT INFO ================= */}
      <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/20">
        
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-60 object-cover rounded-xl mb-4"
          />
        )}

        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-lg text-green-400 mt-1">₹{product.price}</p>

        {product.description && (
          <p className="text-sm text-gray-300 mt-2">
            {product.description}
          </p>
        )}
      </div>

      {/* ================= REVIEWS ================= */}
      <div className="max-w-xl mx-auto mt-6">
        <h2 className="text-xl font-semibold mb-3">Customer Reviews</h2>

        {reviews.length === 0 ? (
          <p className="text-gray-400">No reviews yet</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review, i) => (
              <ReviewCard
                key={i}
                user={review.user}
                rating={review.rating}
                comment={review.comment}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default ProductScreen;
