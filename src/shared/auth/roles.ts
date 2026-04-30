// src/shared/auth/roles.ts

export type Role = "admin" | "seller" | "user";

export const ROLE_PERMISSIONS = {
  admin: ["*"],
  seller: ["products:create", "products:update"],
  user: ["cart:use", "order:create"],
};

export const hasPermission = (role: Role, action: string) => {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes("*") || perms.includes(action);
};