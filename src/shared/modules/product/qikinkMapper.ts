export const mapQikinkProduct = (q: any) => ({
  title: q.name,
  basePrice: q.price,
  images: q.images || [],
});