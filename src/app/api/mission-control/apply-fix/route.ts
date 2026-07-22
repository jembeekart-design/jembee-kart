import { NextResponse } from "next/server";
import { createPullRequest } from "@/mission-control/github/createPullRequest";

export async function POST() {
  try {
    const result = await createPullRequest();

    return NextResponse.json({
      success: result.success,
      branch: result.branch,
      pullRequest: result.pullRequestUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  try {
    const result = await createPullRequest();

    return NextResponse.json({
      success: result.success,
      branch: result.branch,
      pullRequest: result.pullRequestUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
