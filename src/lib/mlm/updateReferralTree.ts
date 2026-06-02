import {
  arrayUnion,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface UpdateReferralTreeData {
  sponsorId: string;
  newUserId: string;
}

export async function updateReferralTree(
  data: UpdateReferralTreeData
) {
  try {

    /* ======================================================
       VALIDATION
    ====================================================== */

    if (!data.sponsorId?.trim()) {
      return {
        success: false,
        message: "Sponsor ID Required"
      };
    }

    if (!data.newUserId?.trim()) {
      return {
        success: false,
        message: "User ID Required"
      };
    }

    if (
      data.sponsorId ===
      data.newUserId
    ) {
      return {
        success: false,
        message:
          "Invalid Referral Relationship"
      };
    }

    /* ======================================================
       SPONSOR REFERRAL DOC
    ====================================================== */

    const sponsorRef = doc(
      db,
      "referrals",
      data.sponsorId
    );

    const sponsorSnap =
      await getDoc(
        sponsorRef
      );

    if (!sponsorSnap.exists()) {

      await setDoc(
        sponsorRef,
        {
          userId:
            data.sponsorId,

          level1: [],
          level2: [],
          level3: [],

          totalNetwork:
            0,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp()
        }
      );
    }

    /* ======================================================
       LEVEL 1
    ====================================================== */

    await updateDoc(
      sponsorRef,
      {
        level1:
          arrayUnion(
            data.newUserId
          ),

        totalNetwork:
          increment(1),

        updatedAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       SPONSOR USER
    ====================================================== */

    const sponsorUserRef =
      doc(
        db,
        "users",
        data.sponsorId
      );

    const sponsorUserSnap =
      await getDoc(
        sponsorUserRef
      );

    if (!sponsorUserSnap.exists()) {
      return {
        success: true
      };
    }

    const sponsorData =
      sponsorUserSnap.data();

    const level2SponsorId =
      sponsorData.sponsorId;

    /* ======================================================
       LEVEL 2
    ====================================================== */

    if (level2SponsorId) {

      const level2Ref =
        doc(
          db,
          "referrals",
          level2SponsorId
        );

      const level2Snap =
        await getDoc(
          level2Ref
        );

      if (!level2Snap.exists()) {

        await setDoc(
          level2Ref,
          {
            userId:
              level2SponsorId,

            level1: [],
            level2: [],
            level3: [],

            totalNetwork:
              0,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp()
          }
        );
      }

      await updateDoc(
        level2Ref,
        {
          level2:
            arrayUnion(
              data.newUserId
            ),

          totalNetwork:
            increment(1),

          updatedAt:
            serverTimestamp()
        }
      );

      /* ======================================================
         LEVEL 3 USER
      ====================================================== */

      const level2UserRef =
        doc(
          db,
          "users",
          level2SponsorId
        );

      const level2UserSnap =
        await getDoc(
          level2UserRef
        );

      if (
        level2UserSnap.exists()
      ) {

        const level2Data =
          level2UserSnap.data();

        const level3SponsorId =
          level2Data.sponsorId;

        /* ======================================================
           LEVEL 3
        ====================================================== */

        if (level3SponsorId) {

          const level3Ref =
            doc(
              db,
              "referrals",
              level3SponsorId
            );

          const level3Snap =
            await getDoc(
              level3Ref
            );

          if (
            !level3Snap.exists()
          ) {

            await setDoc(
              level3Ref,
              {
                userId:
                  level3SponsorId,

                level1: [],
                level2: [],
                level3: [],

                totalNetwork:
                  0,

                createdAt:
                  serverTimestamp(),

                updatedAt:
                  serverTimestamp()
              }
            );
          }

          await updateDoc(
            level3Ref,
            {
              level3:
                arrayUnion(
                  data.newUserId
                ),

              totalNetwork:
                increment(1),

              updatedAt:
                serverTimestamp()
            }
          );
        }
      }
    }

    return {
      success: true,
      message:
        "Referral Tree Updated"
    };

  } catch (error) {

    console.error(
      "REFERRAL TREE ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Something went wrong"
    };
  }
}
