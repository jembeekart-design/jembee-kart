// src/integrations/whatsapp/autoReply.ts

import { sendTextMessage } from "./sendMessage";
import { templates } from "./templates";

type Rule = {
  match: RegExp;
  reply: (ctx: { from: string; text?: string }) => string;
};

const rules: Rule[] = [
  {
    match: /hi|hello|hey/i,
    reply: () => templates.support({}),
  },
  {
    match: /order\s*status/i,
    reply: () =>
      "Please share your Order ID to check the latest status.",
  },
  {
    match: /return|refund/i,
    reply: () =>
      "You can request return within 7 days. Reply with your Order ID.",
  },
];

export const handleAutoReply = async (incoming: {
  from: string;
  text?: string;
}) => {
  const text = incoming.text || "";

  for (const r of rules) {
    if (r.match.test(text)) {
      const msg = r.reply(incoming);
      await sendTextMessage(incoming.from, msg);
      return { replied: true };
    }
  }

  // fallback
  await sendTextMessage(
    incoming.from,
    "Thanks for reaching out! Our team will get back to you shortly."
  );

  return { replied: true };
};