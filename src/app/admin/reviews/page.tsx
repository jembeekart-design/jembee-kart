"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc
} from "firebase/firestore";

import {
  Trash2,
  Star,
  Eye,
  EyeOff
} from "lucide-react";

import { db } from "@/firebase/config";

interface ReviewItem {
  id: string;
  userName: string;
  productName: string;
  review: string;
  rating: number;
  visible: boolean;
  userImage: string;
}

export default function ReviewsPage() {

  const [reviews, setReviews] =
    useState<ReviewItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchReviews();

  }, []);

  async function fetchReviews() {

    try {

      const snapshot =
        await getDocs(
          collection(
            db,
            "reviews"
          )
        );

      const data =
        snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data()
          })
        ) as ReviewItem[];

      setReviews(data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  }

  async function updateReview(
    id: string,
    field: string,
    value: any
  ) {

    try {

      const ref = doc(
        db,
        "reviews",
        id
      );

      await updateDoc(ref, {
        [field]: value
      });

      setReviews((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                [field]: value
              }
            : item
        )
      );

    } catch (error) {

      console.log(error);

    }
  }

  async function deleteReview(
    id: string
  ) {

    try {

      await deleteDoc(
        doc(
          db,
          "reviews",
          id
        )
      );

      setReviews((prev) =>
        prev.filter(
          (item) =>
            item.id !== id
        )
      );

    } catch (error) {

      console.log(error);

    }
  }

  if (loading) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--card-color)] text-[var(--button-text-color)]">
        Loading...
      </div>
    );
  }

  return (

    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-6">

        <h1 className="text-3xl font-black">
          Reviews Manager
        </h1>

        <p className="mt-1 text-sm text-[var(--muted-text-color)]">
          Manage customer reviews
        </p>

      </div>

      {/* REVIEWS */}

      <div className="space-y-5">

        {reviews.map(
          (review) => (

            <div
              key={review.id}
              className="overflow-hidden rounded-[30px] border border-[var(--border-color)]/10 bg-[var(--primary-color)]"
            >

              {/* TOP */}

              <div className="flex items-center justify-between border-b border-[var(--border-color)]/10 p-4">

                <div className="flex items-center gap-4">

                  <img
                    src={
                      review.userImage
                    }
                    alt={
                      review.userName
                    }
                    className="h-16 w-16 rounded-full object-cover"
                  />

                  <div>

                    <h2 className="text-lg font-black">
                      {
                        review.userName
                      }
                    </h2>

                    <p className="text-sm text-[var(--muted-text-color)]">
                      {
                        review.productName
                      }
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-2">

                  <button
                    onClick={() =>
                      updateReview(
                        review.id,
                        "visible",
                        !review.visible
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--card-color)]/10"
                  >

                    {review.visible ? (

                      <Eye size={18} />

                    ) : (

                      <EyeOff size={18} />

                    )}

                  </button>

                  <button
                    onClick={() =>
                      deleteReview(
                        review.id
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--danger-color)]/20 text-[var(--danger-color)]"
                  >

                    <Trash2 size={18} />

                  </button>

                </div>

              </div>

              {/* BODY */}

              <div className="space-y-5 p-4">

                {/* USER */}

                <div>

                  <p className="mb-2 text-sm font-bold">
                    User Name
                  </p>

                  <input
                    type="text"
                    value={
                      review.userName
                    }
                    onChange={(e) =>
                      updateReview(
                        review.id,
                        "userName",
                        e.target.value
                      )
                    }
                    className="w-full rounded-2xl border border-[var(--border-color)]/10 bg-[var(--primary-color)] px-4 py-3 outline-none"
                  />

                </div>

                {/* PRODUCT */}

                <div>

                  <p className="mb-2 text-sm font-bold">
                    Product Name
                  </p>

                  <input
                    type="text"
                    value={
                      review.productName
                    }
                    onChange={(e) =>
                      updateReview(
                        review.id,
                        "productName",
                        e.target.value
                      )
                    }
                    className="w-full rounded-2xl border border-[var(--border-color)]/10 bg-[var(--primary-color)] px-4 py-3 outline-none"
                  />

                </div>

                {/* REVIEW */}

                <div>

                  <p className="mb-2 text-sm font-bold">
                    Review
                  </p>

                  <textarea
                    value={review.review}
                    onChange={(e) =>
                      updateReview(
                        review.id,
                        "review",
                        e.target.value
                      )
                    }
                    className="min-h-[120px] w-full rounded-2xl border border-[var(--border-color)]/10 bg-[var(--primary-color)] px-4 py-3 outline-none"
                  />

                </div>

                {/* RATING */}

                <div>

                  <p className="mb-2 text-sm font-bold">
                    Rating
                  </p>

                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={
                      review.rating
                    }
                    onChange={(e) =>
                      updateReview(
                        review.id,
                        "rating",
                        Number(
                          e.target.value
                        )
                      )
                    }
                    className="w-full rounded-2xl border border-[var(--border-color)]/10 bg-[var(--primary-color)] px-4 py-3 outline-none"
                  />

                </div>

                {/* LIVE PREVIEW */}

                <div className="rounded-[28px] bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-color)] p-5">

                  <div className="flex items-center gap-4">

                    <img
                      src={
                        review.userImage
                      }
                      alt={
                        review.userName
                      }
                      className="h-16 w-16 rounded-full object-cover"
                    />

                    <div>

                      <h2 className="text-xl font-black">
                        {
                          review.userName
                        }
                      </h2>

                      <p className="text-sm text-[var(--button-text-color)]/70">
                        {
                          review.productName
                        }
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 flex gap-1">

                    {Array.from({
                      length:
                        review.rating
                    }).map(
                      (_, index) => (

                        <Star
                          key={index}
                          size={18}
                          fill="white"
                        />

                      )
                    )}

                  </div>

                  <p className="mt-4 text-sm leading-7 text-[var(--button-text-color)]/90">

                    {review.review}

                  </p>

                </div>

              </div>

            </div>

          )
        )}

      </div>

    </main>

  );
}
