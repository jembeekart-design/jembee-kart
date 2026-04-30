import { NextResponse } from "next/server";

// ✅ FIXED PATH
import { verifyWebhook, parseWebhook } from "@/shared/integrations/whatsapp/webhook";
import { handleAutoReply } from "@/shared/integrations/whatsapp/autoReply";

export async function GET(req: Request) {
  try {
    const challenge = verifyWebhook(new URL(req.url));
    return new NextResponse(challenge, { status: 200 });
  } catch {
    return new NextResponse("Forbidden", { status: 403 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const messages = await parseWebhook(body);

  for (const m of messages) {
    await handleAutoReply({ from: m.from, text: m.text });
  }

  return NextResponse.json({ ok: true });
}