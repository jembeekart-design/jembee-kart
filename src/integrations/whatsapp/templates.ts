// src/integrations/whatsapp/templates.ts

export type TemplateInput = Record<string, string | number>;

export const templates = {
  orderConfirmed: (p: TemplateInput) => `
🛒 Order #${p.orderId} confirmed!
Total: ₹${p.amount}
Track: ${p.link}
  `.trim(),

  otp: (p: TemplateInput) => `
🔐 Your OTP is ${p.code}
Valid for 5 minutes.
  `.trim(),

  support: (p: TemplateInput) => `
Hi ${p.name || ""} 👋
How can we help you today?
  `.trim(),
};

// 🔹 simple render helper (if you keep string templates later)
export const render = (tpl: (p: TemplateInput) => string, data: TemplateInput) =>
  tpl(data);