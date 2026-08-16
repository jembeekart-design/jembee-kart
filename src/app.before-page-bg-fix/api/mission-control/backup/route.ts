import { NextResponse } from "next/server";
import { createBackup } from "@/mission-control/backup/backupEngine";

export async function POST() {
  try {
    const result = createBackup();

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Backup failed.",
      },
      { status: 500 }
    );
  }
}
