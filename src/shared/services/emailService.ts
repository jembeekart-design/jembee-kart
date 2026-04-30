// src/shared/services/emailService.ts

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

class EmailService {
  async send(payload: EmailPayload) {
    const res = await fetch("/api/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return res.json();
  }

  // 🔹 Templates
  orderConfirmation(to: string, orderId: string, amount: number) {
    return this.send({
      to,
      subject: `Order Confirmed #${orderId}`,
      html: `
        <div style="font-family:sans-serif">
          <h2>JembeeKart</h2>
          <p>Your order <b>#${orderId}</b> is confirmed.</p>
          <p>Total: ₹${amount}</p>
        </div>
      `,
    });
  }
}

export const emailService = new EmailService();