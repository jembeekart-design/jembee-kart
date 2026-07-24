import { NextRequest, NextResponse } from "next/server";
import { BackupManager } from "@/mission-control/backup/backupManager";

export async function GET() {
  try {
    const backups = BackupManager.list();

    return NextResponse.json({
      success: true,
      backups,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load backups.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    switch (body.action) {
      case "create": {
        const result = BackupManager.create();

        return NextResponse.json(result);
      }

      case "restore": {
        if (!body.backupPath) {
          return NextResponse.json(
            {
              success: false,
              message: "backupPath is required.",
            },
            { status: 400 }
          );
        }

        const result = BackupManager.restore(body.backupPath);

        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action.",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Backup operation failed.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
