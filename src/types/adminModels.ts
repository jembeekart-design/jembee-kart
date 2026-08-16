export interface Order {
  id: string;
  userId: string;
  customerName: string;
  productTitle: string;
  amount: number;
  profitAmount?: number;
  status: string;
  address: string;
  image: string;
  commissionProcessed?: boolean;
  placedAt?: any;
}

export interface KYCRequest {
  id: string;
  fullName: string;
  email: string;
  documentType: string;
  documentNumber: string;
  status: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: string;
  active: boolean;
  minimumAmount: number;
}

export interface Banner {
  title: string;
  image: string;
}

export interface HomepageSettings {
  heroSection: boolean;
  bannerSection: boolean;
  affiliateSection: boolean;
  sellerSection: boolean;
  featuredProducts: boolean;
  trendingProducts: boolean;
  categoriesSection: boolean;
  reviewsSection: boolean;
  sectionOrder: string[];
}
