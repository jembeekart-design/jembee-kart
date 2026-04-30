// src/shared/services/notificationService.ts

import { whatsappService } from "./whatsappService";
import { emailService } from "./emailService";
import { smsService } from "./smsService";

type NotifyInput = {
  user: {
    phone?: string;
    email?: string;
  };
  type: "order" | "otp" | "alert";
  data: any;
};

class NotificationService {
  async notify(input: NotifyInput) {
    const { user, type, data } = input;

    // 🔹 ORDER FLOW
    if (type === "order") {
      const { orderId, amount } = data;

      if (user.phone) {
        const msg = whatsappService.buildOrderMessage(orderId, amount);
        whatsappService.openChat(user.phone, msg);
      }

      if (user.email) {
        await emailService.orderConfirmation(
          user.email,
          orderId,
          amount
        );
      }
    }

    // 🔹 OTP FLOW
    if (type === "otp") {
      if (user.phone) {
        await smsService.sendOTP(user.phone, data.code);
      }
    }

    // 🔹 GENERIC ALERT
    if (type === "alert") {
      if (user.email) {
        await emailService.send({
          to: user.email,
          subject: "Alert",
          html: `<p>${data.message}</p>`,
        });
      }
    }

    return { success: true };
  }
}

export const notificationService = new NotificationService();