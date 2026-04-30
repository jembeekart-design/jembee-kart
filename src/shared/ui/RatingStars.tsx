export const RatingStars = ({ rating = 0 }: any) => {
  return (
    <div>
      {[1,2,3,4,5].map((i) => (
        <span key={i}>
          {i <= rating ? "⭐" : "☆"}
        </span>
      ))}
    </div>
  );
};