// src/shared/sms/sendSMS.ts

type SMSPayload = {
  phone: string;
  message: string;
};

class SMSService {
  // 🔹 Send SMS via API (Fast2SMS / Twilio etc.)
  async send(payload: SMSPayload) {
    const res = await fetch("/api/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return res.json();
  }

  // 🔹 OTP
  async sendOTP(phone: string, code: string) {
    return this.send({
      phone,
      message: `🔐 Your OTP is ${code}. Valid for 5 minutes.`,
    });
  }

  // 🔹 Order Alert
  async sendOrderUpdate(phone: string, orderId: string) {
    return this.send({
      phone,
      message: `🛒 Your order #${orderId} is confirmed!`,
    });
  }
}

export const smsService = new SMSService();