import { readBoundedJson } from "@/lib/server/readBoundedJson";
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authorization.slice(7).trim();
    const decoded = await getAdminAuth().verifyIdToken(token, true);
    const parsedBody = await readBoundedJson(req, 8192);
    if (!parsedBody.ok) {
      return NextResponse.json({ success: false, message: parsedBody.message }, { status: parsedBody.status });
    }
    if (!parsedBody.value || typeof parsedBody.value !== "object" || Array.isArray(parsedBody.value)) {
      return NextResponse.json({ success: false, message: "Request body must be a JSON object" }, { status: 400 });
    }
    const body = parsedBody.value as Record<string, unknown>;

    const photoURL =
      typeof body?.photoURL === "string" ? body.photoURL.trim() : "";

    if (
      !photoURL ||
      photoURL.length > 2048 ||
      !/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(photoURL)
    ) {
      return NextResponse.json(
        { error: "Invalid profile photo URL" },
        { status: 400 }
      );
    }

    await getAdminDb()
      .collection("users")
      .doc(decoded.uid)
      .update({
        photoURL,
        photoUrl: photoURL,
      });

    return NextResponse.json({ success: true, photoURL });
  } catch (error) {
    console.error("Profile photo update failed:", error);

    return NextResponse.json(
      { error: "Profile photo update failed" },
      { status: 500 }
    );
  }
}
