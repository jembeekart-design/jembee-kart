import fs from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";
import { readBoundedJson } from "@/lib/server/readBoundedJson";
import { RollbackManager } from "@/mission-control/rollback/rollbackManager";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return withAdminAuth(async (req: NextRequest) => {
    const parsed = await readBoundedJson(req, 8 * 1024);
    if (!parsed.ok) {
      return NextResponse.json({ success: false, message: parsed.message }, { status: parsed.status });
    }
    if (!parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) {
      return NextResponse.json({ success: false, message: "Request body must be an object." }, { status: 400 });
    }

    const backupPath = (parsed.value as { backupPath?: unknown }).backupPath;
    if (typeof backupPath !== "string" || !backupPath.trim() || backupPath.length > 1024) {
      return NextResponse.json({ success: false, message: "A valid backup path is required." }, { status: 400 });
    }

    const backupRoot = path.resolve(process.cwd(), ".mission-control-backup");
    const resolvedBackup = path.resolve(backupPath);
    const relative = path.relative(backupRoot, resolvedBackup);
    if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
      return NextResponse.json({ success: false, message: "Backup path must identify a backup inside the approved backup directory." }, { status: 400 });
    }
    if (!fs.existsSync(path.join(resolvedBackup, "backup.json")) || !fs.existsSync(path.join(resolvedBackup, "src"))) {
      return NextResponse.json({ success: false, message: "Backup not found or incomplete." }, { status: 404 });
    }
    // Resolve symlinks as well as lexical paths so a backup folder cannot point outside the approved root.
    const realRoot = fs.realpathSync(backupRoot);
    const realBackup = fs.realpathSync(resolvedBackup);
    const realSource = fs.realpathSync(path.join(resolvedBackup, "src"));
    const backupRelative = path.relative(realRoot, realBackup);
    const sourceRelative = path.relative(realBackup, realSource);
    if (!backupRelative || backupRelative.startsWith("..") || path.isAbsolute(backupRelative) || sourceRelative !== "src") {
      return NextResponse.json({ success: false, message: "Backup path is not a valid directory inside the approved backup root." }, { status: 400 });
    }

    const result = RollbackManager.restore(realBackup);
    return NextResponse.json(result, { status: result.success ? 200 : 404 });
  }, request);
}
