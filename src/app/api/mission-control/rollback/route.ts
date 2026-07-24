import { NextRequest, NextResponse } from "next/server";
import { RollbackManager } from "@/mission-control/rollback/rollbackManager";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = RollbackManager.restore(body.backupPath);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Rollback failed.",
      },
      { status: 500 }
    );
  }
}
