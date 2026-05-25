import {
  addDoc,
  collection,
  doc,
  getDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { createNotification }
from "./createNotification";

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
    CHECK USER
    ====================================================== */

    const userRef =
      doc(
        db,
        "users",
        data.userId
      );

    const userSnapshot =
      await getDoc(
        userRef
      );

    if (
      !userSnapshot.exists()
    ) {

      return {

        success: false,

        message:
          "User Not Found"

      };

    }

    const userData =
      userSnapshot.data();

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
            data.subject,

          message:
            data.message,

          category:
            data.category,

          status:
            "open",

          priority:
            "normal",

          adminReply:
            "",

          createdAt:
            Date.now(),

          updatedAt:
            Date.now()
        }
      );

    /* ======================================================
    SAVE NOTIFICATION
    ====================================================== */

    await createNotification({
      userId:
        data.userId,

      title:
        "Support Ticket Created",

      message:
        `Your support ticket "${data.subject}" has been submitted.`,

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

        createdAt:
          Date.now()
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
