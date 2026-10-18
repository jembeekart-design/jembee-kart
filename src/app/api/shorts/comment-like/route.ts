import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { createPostHandler } from "./handler";

export const runtime = "nodejs";

export const POST = createPostHandler({
  verifyToken: async (token) =>
    getAdminAuth().verifyIdToken(token),
  getDb: () => getAdminDb(),
});
