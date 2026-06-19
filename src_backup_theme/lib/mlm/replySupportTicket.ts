import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { createNotification } from "./createNotification";

interface ReplySupportTicketData {
  ticketId: string;

  adminId: string;

  reply: string;

  status?:
    | "open"
    | "in_progress"
    | "resolved"
    | "closed";
}

export async function replySupportTicket(
  data: ReplySupportTicketData
) {
  try {

    /* ======================================================
       VALIDATION
    ====================================================== */

    if (!data.ticketId?.trim()) {
      return {
        success: false,
        message: "Ticket ID Required"
      };
    }

    if (!data.adminId?.trim()) {
      return {
        success: false,
        message: "Admin ID Required"
      };
    }

    if (!data.reply?.trim()) {
      return {
        success: false,
        message: "Reply Required"
      };
    }

    /* ======================================================
       GET TICKET
    ====================================================== */

    const ticketRef = doc(
      db,
      "support_tickets",
      data.ticketId
    );

    const ticketSnapshot =
      await getDoc(ticketRef);

    if (!ticketSnapshot.exists()) {
      return {
        success: false,
        message: "Ticket Not Found"
      };
    }

    const ticketData =
      ticketSnapshot.data();

    /* ======================================================
       STATUS CHECK
    ====================================================== */

    if (
      ticketData.status ===
      "closed"
    ) {
      return {
        success: false,
        message:
          "Ticket Already Closed"
      };
    }

    const newStatus =
      data.status || "resolved";

    /* ======================================================
       UPDATE TICKET
    ====================================================== */

    await updateDoc(
      ticketRef,
      {
        adminReply:
          data.reply.trim(),

        repliedBy:
          data.adminId,

        repliedAt:
          serverTimestamp(),

        status:
          newStatus,

        isClosed:
          newStatus === "closed",

        updatedAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       REPLY HISTORY
    ====================================================== */

    await addDoc(
      collection(
        db,
        "support_ticket_replies"
      ),
      {
        ticketId:
          data.ticketId,

        userId:
          ticketData.userId,

        adminId:
          data.adminId,

        reply:
          data.reply.trim(),

        status:
          newStatus,

        createdAt:
          serverTimestamp()
      }
    );

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
          "support_ticket_reply",

        ticketId:
          data.ticketId,

        adminId:
          data.adminId,

        status:
          newStatus,

        createdAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       USER NOTIFICATION
    ====================================================== */

    await createNotification({
      userId:
        ticketData.userId,

      title:
        "Support Ticket Updated",

      message:
        `Admin replied to your support ticket "${ticketData.subject}".`,

      type:
        "system"
    });

    return {
      success: true,
      message:
        "Reply Sent Successfully"
    };

  } catch (error) {

    console.error(
      "SUPPORT REPLY ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Something went wrong"
    };
  }
}
