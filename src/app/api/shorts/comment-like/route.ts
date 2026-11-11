import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { createPostHandler, type CommentLikeDatabase } from "./handler";

export const runtime = "nodejs";

export const POST = createPostHandler({
  verifyToken: async (token) =>
    getAdminAuth().verifyIdToken(token),
  getDb: () => getAdminDb() as unknown as CommentLikeDatabase,
});
