import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";

export async function GET(request: NextRequest) {
  return withAdminAuth(async () => {
    try {
      const owner = process.env.GITHUB_OWNER;
      const repo = process.env.GITHUB_REPO;
      const token = process.env.GITHUB_TOKEN;
      if (!owner || !repo || !token) {
        return NextResponse.json({ success: false, message: "GitHub integration is not configured." }, { status: 503 });
      }
      const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
        cache: "no-store",
      });
      if (!res.ok) {
        console.error("Mission-control GitHub test returned HTTP", res.status);
        return NextResponse.json({ success: false, message: "GitHub connection test failed." }, { status: 502 });
      }
      const data = await res.json();
      return NextResponse.json({ success: true, repository: data.full_name, defaultBranch: data.default_branch, private: data.private });
    } catch (error) {
      console.error("Mission-control GitHub test failed:", error);
      return NextResponse.json({ success: false, message: "GitHub connection test failed." }, { status: 502 });
    }
  }, request);
}
