// src/shared/services/whatsappService.ts

type WhatsAppPayload = {
  phone: string;
  message: string;
  templateId?: string;
  data?: Record<string, any>;
};

class WhatsAppService {
  // 🔹 Quick open (client-side)
  openChat(phone: string, message: string) {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }
  }

  // 🔹 Server API (Twilio/Meta)
  async send(payload: WhatsAppPayload) {
    const res = await fetch("/api/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return res.json();
  }

  // 🔹 Template helper
  buildOrderMessage(orderId: string, amount: number) {
    return `🛒 Order #${orderId} confirmed!\nTotal: ₹${amount}\nTrack in JembeeKart.`;
  }
}

export const whatsappService = new WhatsAppService();