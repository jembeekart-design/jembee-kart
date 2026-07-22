import { NextResponse } from "next/server";
import { createPullRequest } from "@/mission-control/github/createPullRequest";

export async function POST() {
  try {
    const result = await createPullRequest();

    return NextResponse.json({
      success: result.success,
      status: "pending",
      message: "GitHub Auto Fix started.",
      branch: result.branch,
      pullRequest: result.pullRequestUrl,

      nextStep: {
        provider: "GitHub",
        action: "Create Pull Request",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
