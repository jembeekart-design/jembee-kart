import { getProfile } from "./profileService";
import { getAddresses } from "./addressService";
import { getUserRole } from "./authService";

let userCache: any = null;

// 🔹 Load Full User Data
export const loadUser = async (uid: string) => {
  const [profile, addresses, role] = await Promise.all([
    getProfile(uid),
    getAddresses(uid),
    getUserRole(uid),
  ]);

  userCache = {
    uid,
    role,
    profile,
    addresses,
  };

  return userCache;
};

// 🔹 Get Cached User
export const getUser = () => userCache;

// 🔹 Update Role (Admin only)
export const setUserRole = (user: any, role: string) => {
  user.role = role;
  return user;
};