import { NextResponse } from "next/server";
import { createPullRequest } from "@/mission-control/github/createPullRequest";

async function handleRequest() {
  try {
    const result = await createPullRequest();

    return NextResponse.json({
      success: true,
      branch: result.branch,
      pullRequest: result.pullRequestUrl,
    });
  } catch (error) {
    console.error("Apply Fix Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  return handleRequest();
}

export async function POST() {
  return handleRequest();
}
