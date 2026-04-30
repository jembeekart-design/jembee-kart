import { GlassCard } from "./GlassCard";
import { Button } from "./Button";
import { RatingStars } from "./RatingStars";

export const ProductCard = ({ product }: any) => {
  return (
    <GlassCard>
      <h3>{product.title}</h3>
      <p>₹{product.price}</p>

      <RatingStars rating={product.rating || 4} />

      <Button>Add to Cart</Button>
    </GlassCard>
  );
};