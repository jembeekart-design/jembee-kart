import {
  arrayUnion,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface UpdateReferralTreeData {

  newUserId: string;

  sponsorId: string;

}

export async function updateReferralTree(
  data: UpdateReferralTreeData
) {

  try {

    /* ======================================================
    LEVEL 1 UPDATE
    ====================================================== */

    const sponsorRef =
      doc(
        db,
        "referrals",
        data.sponsorId
      );

    await updateDoc(
      sponsorRef,
      {
        level1:
          arrayUnion(
            data.newUserId
          )
      }
    );

    /* ======================================================
    GET SPONSOR DATA
    ====================================================== */

    const sponsorUserRef =
      doc(
        db,
        "users",
        data.sponsorId
      );

    const sponsorSnapshot =
      await getDoc(
        sponsorUserRef
      );

    if (
      !sponsorSnapshot.exists()
    ) {

      return;

    }

    const sponsorData =
      sponsorSnapshot.data();

    const level2SponsorId =
      sponsorData.sponsorId;

    /* ======================================================
    LEVEL 2 UPDATE
    ====================================================== */

    if (
      level2SponsorId
    ) {

      const level2Ref =
        doc(
          db,
          "referrals",
          level2SponsorId
        );

      await updateDoc(
        level2Ref,
        {
          level2:
            arrayUnion(
              data.newUserId
            )
        }
      );

      /* ======================================================
      GET LEVEL 2 USER
      ====================================================== */

      const level2UserRef =
        doc(
          db,
          "users",
          level2SponsorId
        );

      const level2Snapshot =
        await getDoc(
          level2UserRef
        );

      if (
        level2Snapshot.exists()
      ) {

        const level2Data =
          level2Snapshot.data();

        const level3SponsorId =
          level2Data.sponsorId;

        /* ======================================================
        LEVEL 3 UPDATE
        ====================================================== */

        if (
          level3SponsorId
        ) {

          const level3Ref =
            doc(
              db,
              "referrals",
              level3SponsorId
            );

          await updateDoc(
            level3Ref,
            {
              level3:
                arrayUnion(
                  data.newUserId
                )
            }
          );

        }

      }

    }

    console.log(
      "Referral Tree Updated"
    );

  } catch (error) {

    console.error(
      "REFERRAL TREE ERROR:",
      error
    );

  }

}
