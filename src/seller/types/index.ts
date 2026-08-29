export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  costPrice: number;
  images: string[];
  category: string;
  subcategory?: string;
  sku: string;
  stock: number;
  views: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  sellerId: string;
  buyerId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Review {
  id: string;
  productId: string;
  buyerId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
