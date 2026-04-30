// src/integrations/whatsapp/sendMessage.ts

/**
 * Default: Meta WhatsApp Cloud API
 * ENV:
 *  WHATSAPP_API_URL=https://graph.facebook.com/v19.0
 *  WHATSAPP_PHONE_NUMBER_ID=xxxx
 *  WHATSAPP_ACCESS_TOKEN=xxxx
 */

const API_URL = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v19.0";
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;

export type SendWAInput = {
  to: string;               // E.164 without +
  text?: string;            // simple text
  templateName?: string;    // if using approved template
  language?: string;        // "en", "hi"
  components?: any[];       // template components
};

const post = async (body: any) => {
  const res = await fetch(`${API_URL}/${PHONE_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "WhatsApp send failed");
  }
  return data;
};

export const sendTextMessage = async (to: string, text: string) => {
  const body = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text },
  };
  return post(body);
};

// 🔹 Approved template send (production use)
export const sendTemplateMessage = async (input: SendWAInput) => {
  const body = {
    messaging_product: "whatsapp",
    to: input.to,
    type: "template",
    template: {
      name: input.templateName,
      language: { code: input.language || "en" },
      components: input.components || [],
    },
  };
  return post(body);
};