import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export async function verifyMonetagAdmin(req: Request): Promise<string> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const token = header.slice(7).trim();
  if (!token) throw new Error("UNAUTHORIZED");
  const decoded = await getAdminAuth().verifyIdToken(token);
  const users = getAdminDb().collection("users");
  let data = (await users.doc(decoded.uid).get()).data();
  if (data?.role !== "admin" && data?.role !== "super_admin") {
    const fallback = await users.where("uid", "==", decoded.uid).limit(1).get();
    data = fallback.docs[0]?.data();
  }
  if (data?.role !== "admin" && data?.role !== "super_admin") throw new Error("FORBIDDEN");
  return decoded.uid;
}

export async function verifyMonetagUser(req: Request): Promise<string> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const decoded = await getAdminAuth().verifyIdToken(header.slice(7).trim());
  return decoded.uid;
}
