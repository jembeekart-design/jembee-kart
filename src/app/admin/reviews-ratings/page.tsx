"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc
} from "firebase/firestore";

import {
  Star,
  Trash2,
  User,
  Package,
  ShieldCheck,
  EyeOff
} from "lucide-react";

import { db } from "@/firebase/config";

interface ReviewData {
  id?: string;
  userName: string;
  productName: string;
  rating: number;
  review: string;
  status: string;
}

export default function ReviewsRatingsPage() {

  const [reviews, setReviews] =
    useState<ReviewData[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const q = query(
      collection(
        db,
        "reviews_ratings"
      ),
      orderBy(
        "rating",
        "desc"
      )
    );

    const unsubscribe =
      onSnapshot(q, (snapshot) => {

        const data:
          ReviewData[] = [];

        snapshot.forEach((doc) => {

          data.push({
            id: doc.id,
            ...doc.data()
          } as ReviewData);

        });

        setReviews(data);

        setLoading(false);

      });

    return () =>
      unsubscribe();

  }, []);

  async function updateStatus(
    id: string,
    status: string
  ) {

    try {

      await updateDoc(
        doc(
          db,
          "reviews_ratings",
          id
        ),
        {
          status
        }
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
          "reviews_ratings",
          id
        )
      );

    } catch (error) {

      console.log(error);

    }
  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-black text-[var(--button-text-color)]">

        Loading Reviews...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--warning-color)]">

          <Star size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Reviews & Ratings
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Manage customer reviews
          </p>

        </div>

      </div>

      {/* REVIEWS */}

      <div className="space-y-5">

        {reviews.length === 0 && (

          <div className="rounded-[30px] bg-[#151515] p-10 text-center">

            No Reviews Found

          </div>

        )}

        {reviews.map(
          (review) => (

            <div
              key={review.id}
              className="rounded-[30px] bg-[#151515] p-5"
            >

              <div className="flex flex-col gap-6">

                {/* TOP */}

                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                  <div>

                    <div className="flex items-center gap-3">

                      <User size={20} />

                      <h2 className="text-2xl font-black text-yellow-400">

                        {review.userName}

                      </h2>

                    </div>

                    <div className="mt-3 flex items-center gap-2 text-gray-300">

                      <Package size={16} />

                      {review.productName}

                    </div>

                  </div>

                  <StatusBadge
                    status={
                      review.status
                    }
                  />

                </div>

                {/* STARS */}

                <div className="flex items-center gap-2">

                  {Array.from({
                    length: 5
                  }).map(
                    (_, index) => (

                      <Star
                        key={index}
                        size={22}
                        className={
                          index <
                          review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-[var(--muted-text-color)]"
                        }
                      />

                    )
                  )}

                </div>

                {/* REVIEW */}

                <div className="rounded-2xl bg-black/30 p-4">

                  <p className="text-gray-300">

                    {review.review}

                  </p>

                </div>

                {/* ACTIONS */}

                <div className="flex flex-wrap gap-3">

                  <button
                    onClick={() =>
                      updateStatus(
                        review.id!,
                        "Approved"
                      )
                    }
                    className="flex items-center gap-2 rounded-2xl bg-[var(--success-color)] px-5 py-3 font-bold text-[var(--text-color)]"
                  >

                    <ShieldCheck size={18} />

                    Approve

                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        review.id!,
                        "Hidden"
                      )
                    }
                    className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 font-bold text-[var(--text-color)]"
                  >

                    <EyeOff size={18} />

                    Hide

                  </button>

                  <button
                    onClick={() =>
                      deleteReview(
                        review.id!
                      )
                    }
                    className="flex items-center gap-2 rounded-2xl bg-[var(--danger-color)] px-5 py-3 font-bold"
                  >

                    <Trash2 size={18} />

                    Delete

                  </button>

                </div>

              </div>

            </div>

          )
        )}

      </div>

    </main>

  );
}

function StatusBadge({
  status
}: {
  status: string;
}) {

  function getColor() {

    if (status === "Approved") {

      return "bg-[var(--success-color)]";

    }

    if (status === "Hidden") {

      return "bg-orange-500";

    }

    return "bg-[var(--warning-color)]";

  }

  return (

    <div
      className={`rounded-full px-5 py-3 text-sm font-bold ${getColor()}`}
    >

      {status}

    </div>

  );
}
