export type Variant = {
  id: string;
  size: string;
  color: string;
  stock: number;
  price?: number;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  category?: string;
  basePrice: number;
  finalPrice?: number;
  images: string[];
  variants: Variant[];
  createdAt: number;
};