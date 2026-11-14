import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { createResumableUploadSession } from "@/services/googleDriveService";
import { classifyGoogleDriveError, googleDriveClientMessage, googleDriveErrorHttpStatus } from "@/lib/googleDriveErrors";
import { validateVideoUpload } from "@/schemas/media/videoUpload";
import { validateUploadMetadata } from "@/modules/media/uploadMetadata";
import { DEFAULT_EXPLORE_CATEGORIES } from "@/lib/catalog/defaultExploreCategories";

export const runtime = "nodejs";


export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { success: false, message: "कृपया लॉगिन करें।" },
      { status: 401 }
    );
  }

  const token = authHeader.slice("Bearer ".length).trim();
  let creatorId: string;

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token, true);
    creatorId = decodedToken.uid;
  } catch (err) {
    console.error("Creator upload authentication failed");
    return NextResponse.json(
      { success: false, message: "कृपया लॉगिन करें।" },
      { status: 401 }
    );
  }

  let body: {
    filename?: unknown;
    mimeType?: unknown;
    fileSize?: unknown;
    displayName?: unknown;
    photoURL?: unknown;
    username?: unknown;
    caption?: unknown;
    videoAccess?: unknown;
    videoPrice?: unknown;
    videoFormat?: unknown;
    durationSeconds?: unknown;
    hashtags?: unknown;
    music?: unknown;
    sponsor?: unknown;
    originalVideoId?: unknown;
    originalAudioId?: unknown;
    isEnhanced?: unknown;
    categoryId?: unknown;
    categoryName?: unknown;
    categoryTopic?: unknown;
    schoolBoardId?: unknown;
    schoolId?: unknown;
    schoolClassId?: unknown;
    schoolSubjectId?: unknown;
    schoolBookId?: unknown;
    schoolChapterId?: unknown;
    schoolQuestionId?: unknown;
  };
  try {
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 16 * 1024) {
      return NextResponse.json({ success: false, message: "अनुरोध की जानकारी बहुत बड़ी है।" }, { status: 413 });
    }
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > 16 * 1024) {
      return NextResponse.json({ success: false, message: "अनुरोध की जानकारी बहुत बड़ी है।" }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { success: false, message: "अनुरोध की जानकारी सही नहीं है।" },
      { status: 400 }
    );
  }

  const upload = validateVideoUpload(body);
  if (!upload.ok) {
    const message = upload.reason === "invalid_mime"
      ? "कृपया मान्य वीडियो फ़ाइल चुनें।"
      : upload.reason === "too_large"
        ? "वीडियो का आकार 500 MB से अधिक नहीं होना चाहिए।"
        : "कुछ आवश्यक जानकारी उपलब्ध नहीं है। कृपया विवरण जाँचें।";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
  const { filename, mimeType, fileSize } = upload;
  const metadata = validateUploadMetadata(body);
  if (!metadata) {
    return NextResponse.json({ success: false, message: "वीडियो का विवरण मान्य नहीं है। कृपया caption, hashtags और अन्य जानकारी जाँचें।" }, { status: 400 });
  }
  const { displayName, photoURL, username, caption, hashtags, music, sponsor, originalVideoId, originalAudioId, isEnhanced } = metadata;
  const videoAccess = body.videoAccess === "paid" ? "paid" : "free";
  if (videoAccess === "paid") {
    return NextResponse.json({ success: false, message: "Paid video publishing is temporarily disabled until verified purchase access is available." }, { status: 409 });
  }
  const { videoFormat, durationSeconds } = metadata;
  const safeId = (value: unknown) => typeof value === "string" && /^[a-z0-9][a-z0-9_-]{1,63}$/.test(value) ? value : "";
  const categoryId = safeId(body.categoryId);
  const categoryName = typeof body.categoryName === "string" ? body.categoryName.trim().slice(0, 80) : "";
  const categoryTopic = typeof body.categoryTopic === "string" ? body.categoryTopic.trim().slice(0, 120) : "";
  if (!categoryId || !categoryName) return NextResponse.json({ success: false, message: "कृपया मान्य Category चुनें।" }, { status: 400 });
  const schoolIds = {
    schoolBoardId: safeId(body.schoolBoardId), schoolId: safeId(body.schoolId),
    schoolClassId: safeId(body.schoolClassId), schoolSubjectId: safeId(body.schoolSubjectId),
    schoolBookId: safeId(body.schoolBookId), schoolChapterId: safeId(body.schoolChapterId),
    schoolQuestionId: safeId(body.schoolQuestionId),
  };
  const hasSchoolMetadata = Object.values(schoolIds).some(Boolean);
  if (categoryId === "school") {
    if (!schoolIds.schoolBoardId || !schoolIds.schoolId || !schoolIds.schoolClassId || (!schoolIds.schoolSubjectId && !schoolIds.schoolBookId) || (schoolIds.schoolSubjectId && schoolIds.schoolBookId)) {
      return NextResponse.json({ success: false, message: "School video के लिए Board, School, Class और Subject या Book चुनना आवश्यक है।" }, { status: 400 });
    }
  } else if (hasSchoolMetadata) {
    return NextResponse.json({ success: false, message: "School hierarchy केवल School category के साथ भेजें।" }, { status: 400 });
  }

  const submissionId = crypto.randomUUID();

  try {
    const adminDb = getAdminDb();
    const categoryRef = adminDb.collection("contentCategories").doc(categoryId);
    const categorySnap = await categoryRef.get();
    const defaultCategory = DEFAULT_EXPLORE_CATEGORIES.find((item) => item.id === categoryId);
    if (!categorySnap.exists && !defaultCategory) return NextResponse.json({ success: false, message: "यह Category उपलब्ध नहीं है।" }, { status: 400 });
    if (categorySnap.exists && categorySnap.data()?.status !== "published") {
      return NextResponse.json({ success: false, message: "यह Category अभी प्रकाशित नहीं है।" }, { status: 400 });
    }
    const categoryRecord = categorySnap.exists ? categorySnap.data() : defaultCategory;
    if (categoryRecord?.name !== categoryName) return NextResponse.json({ success: false, message: "चुनी गई Category की जानकारी मेल नहीं खाती।" }, { status: 400 });
    const allowedTopics = Array.isArray(categoryRecord?.topics) ? categoryRecord.topics : [];
    if (categoryTopic && !allowedTopics.includes(categoryTopic)) return NextResponse.json({ success: false, message: "चुना गया Topic इस Category का हिस्सा नहीं है।" }, { status: 400 });
    if (categoryId === "school") {
      const nodeTypes: Record<keyof typeof schoolIds, string> = {
        schoolBoardId: "board", schoolId: "school", schoolClassId: "class", schoolSubjectId: "subject",
        schoolBookId: "book", schoolChapterId: "chapter", schoolQuestionId: "question",
      };
      const nodeSnaps = await Promise.all(Object.entries(schoolIds).filter(([, id]) => Boolean(id)).map(async ([key, id]) => ({ key, snap: await adminDb.collection("schoolLearningNodes").doc(id).get() })));
      const nodeData = new Map<string, Record<string, unknown>>();
      for (const { key, snap } of nodeSnaps) {
        if (!snap.exists || snap.data()?.status !== "published" || snap.data()?.type !== nodeTypes[key as keyof typeof schoolIds]) {
          return NextResponse.json({ success: false, message: "School catalog में चुनी गई कोई entry उपलब्ध नहीं है।" }, { status: 400 });
        }
        nodeData.set(key, snap.data()!);
      }
      const expectedParents: [keyof typeof schoolIds, keyof typeof schoolIds][] = [
        ["schoolId", "schoolBoardId"], ["schoolClassId", "schoolId"],
      ];
      for (const [child, parent] of expectedParents) if (nodeData.get(child)?.parentId !== schoolIds[parent]) return NextResponse.json({ success: false, message: "School hierarchy का क्रम सही नहीं है।" }, { status: 400 });
      const subjectOrBookId = schoolIds.schoolSubjectId || schoolIds.schoolBookId;
      const subjectOrBook = nodeData.get(schoolIds.schoolSubjectId ? "schoolSubjectId" : "schoolBookId");
      if (subjectOrBook?.parentId !== schoolIds.schoolClassId) return NextResponse.json({ success: false, message: "Subject / Book चुनी गई Class से संबंधित नहीं है।" }, { status: 400 });
      if (schoolIds.schoolChapterId && nodeData.get("schoolChapterId")?.parentId !== subjectOrBookId) return NextResponse.json({ success: false, message: "Chapter चुने गए Subject / Book से संबंधित नहीं है।" }, { status: 400 });
      if (schoolIds.schoolQuestionId && (!schoolIds.schoolChapterId || nodeData.get("schoolQuestionId")?.parentId !== schoolIds.schoolChapterId)) return NextResponse.json({ success: false, message: "Question चुने गए Chapter से संबंधित नहीं है।" }, { status: 400 });
    }
    const activeSessions = await adminDb.collection("videoModerationSubmissions")
      .where("creatorId", "==", creatorId)
      .where("status", "in", ["uploading", "completing"])
      .limit(3).get();
    if (activeSessions.size >= 2) {
      return NextResponse.json({ success: false, message: "एक समय में अधिकतम 2 वीडियो upload session ही सक्रिय रख सकते हैं।" }, { status: 429 });
    }
    const cooldownRef = adminDb.collection("creatorUploadRateLimits").doc(creatorId);
    const allowed = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(cooldownRef);
      const last = Number(snap.data()?.lastStartedAtMs || 0);
      if (Date.now() - last < 30000) return false;
      tx.set(cooldownRef, { lastStartedAtMs: Date.now(), updatedAt: new Date() }, { merge: true });
      return true;
    });
    if (!allowed) return NextResponse.json({ success: false, message: "कृपया नया upload शुरू करने से पहले 30 सेकंड प्रतीक्षा करें।" }, { status: 429 });

    const uploadUrl = await createResumableUploadSession(
      `moderation_${submissionId}`,
      mimeType,
      fileSize
    );

    console.log("[UPLOAD_DEBUG_SERVER] DRIVE_SESSION_CREATED", {
      submissionId,
      uploadUrlPresent: !!uploadUrl,
    });

    await adminDb
      .collection("videoModerationSubmissions")
      .doc(submissionId)
      .set({
        submissionId,
        creatorId,
        driveFileId: "",
        uploadUrl,
        fileSize,
        status: "uploading",
        displayName: displayName || "",
        photoURL: photoURL || "",
        username: username || "",
        caption: caption || "",
        videoAccess,
        videoPrice: 0,
        videoFormat,
        durationSeconds,
        paidVideoStatus: "free",
        hashtags: Array.isArray(hashtags) ? hashtags : [],
        music: music || "",
        sponsor: sponsor === true,
        originalVideoId: originalVideoId || "",
        originalAudioId: originalAudioId || "",
        isEnhanced: isEnhanced === true,
        categoryId,
        categoryName,
        categoryTopic,
        ...schoolIds,
        createdAt: new Date(),
      });

    return NextResponse.json({
      success: true,
      submissionId,
      uploadUrl,
    });
  } catch (error) {
    const code = classifyGoogleDriveError(error);
    console.error("Drive upload session creation failed:", code);
    return NextResponse.json(
      { success: false, code, message: googleDriveClientMessage(code) },
      { status: googleDriveErrorHttpStatus(code) }
    );
  }
}
