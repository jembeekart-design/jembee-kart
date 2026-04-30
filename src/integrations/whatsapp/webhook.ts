// src/integrations/whatsapp/webhook.ts

/**
 * Use in Next.js route:
 *  GET  -> verification
 *  POST -> receive messages/status
 *
 * ENV:
 *  WHATSAPP_VERIFY_TOKEN=xxxx
 */

export const verifyWebhook = (reqUrl: URL) => {
  const mode = reqUrl.searchParams.get("hub.mode");
  const token = reqUrl.searchParams.get("hub.verify_token");
  const challenge = reqUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return challenge || "";
  }
  throw new Error("Webhook verification failed");
};

export type WAIncoming = {
  from: string;
  text?: string;
  type: string;
  raw: any;
};

export const parseWebhook = async (body: any): Promise<WAIncoming[]> => {
  const changes = body?.entry?.[0]?.changes?.[0]?.value;
  const messages = changes?.messages || [];

  const list: WAIncoming[] = messages.map((m: any) => ({
    from: m.from,
    type: m.type,
    text: m.text?.body,
    raw: m,
  }));

  return list;
};