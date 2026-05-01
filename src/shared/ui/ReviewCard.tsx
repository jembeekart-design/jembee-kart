type Review = {
  user?: string;
  rating: number;
  comment: string;
  source: "admin" | "user";
};

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-lg">
      
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-white">
          {review.user || "Anonymous"}
        </h3>

        <span className="text-yellow-400">
          ⭐ {review.rating}
        </span>
      </div>

      <p className="text-gray-300 text-sm">{review.comment}</p>

      <span className="text-xs text-gray-400 mt-2 block">
        {review.source === "admin" ? "Verified Purchase" : "User Review"}
      </span>

    </div>
  );
}
