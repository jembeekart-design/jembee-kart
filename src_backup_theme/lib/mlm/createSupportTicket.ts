import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { createNotification } from "./createNotification";

interface SupportTicketData {
  userId: string;

  subject: string;

  message: string;

  category:
    | "withdraw"
    | "commission"
    | "kyc"
    | "technical"
    | "account"
    | "other";
}

export async function createSupportTicket(
  data: SupportTicketData
) {
  try {

    /* ======================================================
       VALIDATION
    ====================================================== */

    if (!data.userId?.trim()) {
      return {
        success: false,
        message: "User ID Required"
      };
    }

    if (!data.subject?.trim()) {
      return {
        success: false,
        message: "Subject Required"
      };
    }

    if (data.subject.trim().length < 5) {
      return {
        success: false,
        message:
          "Subject must be at least 5 characters"
      };
    }

    if (!data.message?.trim()) {
      return {
        success: false,
        message: "Message Required"
      };
    }

    if (data.message.trim().length < 10) {
      return {
        success: false,
        message:
          "Message must be at least 10 characters"
      };
    }

    /* ======================================================
       GET USER
    ====================================================== */

    const userRef = doc(
      db,
      "users",
      data.userId
    );

    const userSnapshot =
      await getDoc(userRef);

    if (!userSnapshot.exists()) {
      return {
        success: false,
        message: "User Not Found"
      };
    }

    const userData =
      userSnapshot.data();

    /* ======================================================
       BLOCKED USER CHECK
    ====================================================== */

    if (userData.isBlocked) {
      return {
        success: false,
        message:
          "Your account is blocked"
      };
    }

    /* ======================================================
       PRIORITY
    ====================================================== */

    let priority:
      | "low"
      | "normal"
      | "high" = "normal";

    if (
      data.category === "withdraw" ||
      data.category === "commission"
    ) {
      priority = "high";
    }

    /* ======================================================
       CREATE TICKET
    ====================================================== */

    const ticketRef =
      await addDoc(
        collection(
          db,
          "support_tickets"
        ),
        {
          userId:
            data.userId,

          userName:
            userData.name || "",

          userEmail:
            userData.email || "",

          subject:
            data.subject.trim(),

          message:
            data.message.trim(),

          category:
            data.category,

          status:
            "open",

          priority,

          adminReply:
            "",

          isClosed:
            false,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp()
        }
      );

    /* ======================================================
       USER NOTIFICATION
    ====================================================== */

    await createNotification({
      userId:
        data.userId,

      title:
        "Support Ticket Created",

      message:
        `Your support ticket "${data.subject.trim()}" has been submitted successfully.`,

      type:
        "system"
    });

    /* ======================================================
       ADMIN LOG
    ====================================================== */

    await addDoc(
      collection(
        db,
        "admin_logs"
      ),
      {
        action:
          "support_ticket_created",

        ticketId:
          ticketRef.id,

        userId:
          data.userId,

        category:
          data.category,

        priority,

        createdAt:
          serverTimestamp()
      }
    );

    return {
      success: true,

      ticketId:
        ticketRef.id,

      message:
        "Support Ticket Created Successfully"
    };

  } catch (error) {

    console.error(
      "SUPPORT TICKET ERROR:",
      error
    );

    return {
      success: false,

      message:
        "Something went wrong"
    };
  }
}
