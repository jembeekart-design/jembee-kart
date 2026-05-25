import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { createNotification }
from "./createNotification";

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
    GET TICKET
    ====================================================== */

    const ticketRef =
      doc(
        db,
        "support_tickets",
        data.ticketId
      );

    const ticketSnapshot =
      await getDoc(
        ticketRef
      );

    if (
      !ticketSnapshot.exists()
    ) {

      return {

        success: false,

        message:
          "Ticket Not Found"

      };

    }

    const ticketData =
      ticketSnapshot.data();

    /* ======================================================
    UPDATE TICKET
    ====================================================== */

    await updateDoc(
      ticketRef,
      {
        adminReply:
          data.reply,

        repliedBy:
          data.adminId,

        repliedAt:
          Date.now(),

        status:
          data.status ||
          "resolved",

        updatedAt:
          Date.now()
      }
    );

    /* ======================================================
    SAVE REPLY HISTORY
    ====================================================== */

    await addDoc(
      collection(
        db,
        "support_ticket_replies"
      ),
      {
        ticketId:
          data.ticketId,

        adminId:
          data.adminId,

        reply:
          data.reply,

        createdAt:
          Date.now()
      }
    );

    /* ======================================================
    SAVE ADMIN LOG
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

        createdAt:
          Date.now()
      }
    );

    /* ======================================================
    CREATE NOTIFICATION
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
