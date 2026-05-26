import {
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface UpdateReferralTreeData {

  sponsorId: string;

  newUserId: string;

}

export async function
updateReferralTree(
  data:
  UpdateReferralTreeData
) {

  try {

    /* ======================================================
       CREATE REFERRAL DOC IF NOT EXISTS
    ====================================================== */

    const sponsorRef =
      doc(
        db,
        "referrals",
        data.sponsorId
      );

    const sponsorRefSnap =
      await getDoc(
        sponsorRef
      );

    if (
      !sponsorRefSnap.exists()
    ) {

      await setDoc(
        sponsorRef,
        {
          level1: [],
          level2: [],
          level3: [],
          createdAt:
            Date.now()
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

        updatedAt:
          Date.now()
      }
    );

    /* ======================================================
       GET SPONSOR USER
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

      return {
        success: false
      };
    }

    const sponsorData =
      sponsorSnapshot.data();

    const level2SponsorId =
      sponsorData.sponsorId;

    /* ======================================================
       LEVEL 2
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

      const level2Snap =
        await getDoc(
          level2Ref
        );

      if (
        !level2Snap.exists()
      ) {

        await setDoc(
          level2Ref,
          {
            level1: [],
            level2: [],
            level3: [],
            createdAt:
              Date.now()
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

          updatedAt:
            Date.now()
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
           LEVEL 3
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
                level1: [],
                level2: [],
                level3: [],
                createdAt:
                  Date.now()
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

              updatedAt:
                Date.now()
            }
          );

        }

      }

    }

    console.log(
      "Referral Tree Updated"
    );

    return {
      success: true
    };

  } catch (error) {

    console.error(
      "REFERRAL TREE ERROR:",
      error
    );

    return {
      success: false
    };
  }
}
