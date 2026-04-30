// src/shared/services/smsService.ts

type SMSPayload = {
  phone: string;
  message: string;
};

class SMSService {
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

  sendOTP(phone: string, code: string) {
    return this.send({
      phone,
      message: `Your OTP is ${code}`,
    });
  }
}

export const smsService = new SMSService();