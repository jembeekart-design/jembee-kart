// src/shared/sdk/whatsappClient.ts

class WhatsAppClient {
  // 🔹 Open WhatsApp chat (client-side)
  openChat(phone: string, message: string) {
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  // 🔹 Send via server (Twilio/Meta API) – recommended
  async sendServer(payload: {
    phone: string;
    message: string;
    templateId?: string;
    data?: Record<string, any>;
  }) {
    const res = await fetch("/api/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  // 🔹 Convenience: order confirmation message
  buildOrderMessage(orderId: string, total: number) {
    return `Your order #${orderId} is confirmed. Total: ₹${total}. Track it on JembeeKart.`;
  }
}

export const whatsappClient = new WhatsAppClient();