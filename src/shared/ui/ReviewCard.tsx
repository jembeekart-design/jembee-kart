"use client";

export const ReviewCard = ({
  user,
  rating,
  comment,
}: {
  user?: string;
  rating: number;
  comment: string;
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
      <h3 className="text-white font-bold">{user || "Anonymous"}</h3>

      <div className="text-yellow-400">
        {"⭐".repeat(rating)}
      </div>

      <p className="text-gray-300 mt-2">{comment}</p>
    </div>
  );
};
