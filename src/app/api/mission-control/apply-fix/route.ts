import { requireAdmin, isAdminIdentity } from "@/lib/server/requireAdmin";
import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";

import {
  fixHardcodedBusinessRules,
} from "@/mission-control/autofix/hardcodedRuleAutoFix";

import {
  applyAstFix,
} from "@/mission-control/autofix/astAutoFix";

import {
  createPullRequest,
} from "@/mission-control/github/createPullRequest";

async function handleRequest() {
  try {
    const started = Date.now();

    // Step 1: Run Rule Fix
    const ruleResult = fixHardcodedBusinessRules();

    // Step 2: Run AST Fix
    const astResult = await applyAstFix();

    // Step 3: Create GitHub PR
    const pr = await createPullRequest();

    const duration = Date.now() - started;

    return NextResponse.json({
      success: true,
      message: "Mission Control Auto Fix completed.",

      rules: ruleResult,

      ast: astResult,

      github: {
        branch: pr.branch,
        pullRequest: pr.pullRequestUrl,
      },

      duration,
    });
  } catch (error) {
    console.error("Apply Fix Error:", error);

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

export async function GET() {
  return NextResponse.json({ success: false, message: "Auto-fix requires an authenticated POST request." }, { status: 405, headers: { Allow: "POST" } });
}

export async function POST(req: Request) {
  const adminIdentity = await requireAdmin(req);
  if (!isAdminIdentity(adminIdentity)) return adminIdentity;

  return withAdminAuth(async () => handleRequest(), req);
}
