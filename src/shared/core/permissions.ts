export type Role = "admin" | "seller" | "user";

export const can = (role: Role, action: string) => {
  const map: Record<Role, string[]> = {
    admin: ["*"],
    seller: ["products:create", "products:update"],
    user: ["cart:use", "order:create"],
  };

  return map[role].includes("*") || map[role].includes(action);
};