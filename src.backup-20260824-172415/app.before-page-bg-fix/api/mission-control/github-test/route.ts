import { NextResponse } from "next/server";

export async function GET() {
  try {
    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;
    const token = process.env.GITHUB_TOKEN!;

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const data = await res.json();

    return NextResponse.json({
      success: res.ok,
      repository: data.full_name,
      defaultBranch: data.default_branch,
      private: data.private,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
