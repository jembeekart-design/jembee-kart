export type Role = "admin" | "seller" | "user";

export type User = {
  id: string;
  email: string;
  role: Role;
  createdAt: number;
};

export type Profile = {
  name: string;
  avatar?: string;
  phone?: string;
};

export type Address = {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};