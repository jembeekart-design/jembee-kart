import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { distributeLevelCommission }
from "./distributeLevelCommission";

import { updateRank }
from "./updateRank";

interface PurchasePackageData {

  userId: string;

  packageId: string;

}

export async function createMLMPackagePurchase(
  data: PurchasePackageData
) {

  try {

    /* ======================================================
    GET PACKAGE
    ====================================================== */

    const packageRef =
      doc(
        db,
        "mlm_packages",
        data.packageId
      );

    const packageSnapshot =
      await getDoc(
        packageRef
      );

    if (
      !packageSnapshot.exists()
    ) {

      return {

        success: false,

        message:
          "Package Not Found"

      };

    }

    const packageData =
      packageSnapshot.data();

    /* ======================================================
    GET USER
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
    UPDATE USER PACKAGE
    ====================================================== */

    await updateDoc(
      userRef,
      {
        package:
          packageData.title,

        packageAmount:
          packageData.price,

        packagePurchasedAt:
          Date.now()
      }
    );

    /* ======================================================
    SAVE PURCHASE HISTORY
    ====================================================== */

    await addDoc(
      collection(
        db,
        "package_purchases"
      ),
      {
        userId:
          data.userId,

        packageId:
          data.packageId,

        packageTitle:
          packageData.title,

        amount:
          packageData.price,

        status:
          "success",

        createdAt:
          Date.now()
      }
    );

    /* ======================================================
    SAVE TRANSACTION
    ====================================================== */

    await addDoc(
      collection(
        db,
        "transactions"
      ),
      {
        userId:
          data.userId,

        type:
          "package_purchase",

        amount:
          packageData.price,

        packageTitle:
          packageData.title,

        status:
          "success",

        createdAt:
          Date.now()
      }
    );

    /* ======================================================
    DISTRIBUTE COMMISSION
    ====================================================== */

    await distributeLevelCommission({
      userId:
        data.userId,

      packageAmount:
        packageData.price
    });

    /* ======================================================
    UPDATE RANK
    ====================================================== */

    if (
      userData.sponsorId
    ) {

      await updateRank(
        userData.sponsorId
      );

    }

    /* ======================================================
    SAVE NOTIFICATION
    ====================================================== */

    await addDoc(
      collection(
        db,
        "notifications"
      ),
      {
        userId:
          data.userId,

        title:
          "Package Activated",

        message:
          `Your ${packageData.title} package is now active.`,

        type:
          "package",

        isRead:
          false,

        createdAt:
          Date.now()
      }
    );

    return {

      success: true,

      message:
        "Package Purchased Successfully"

    };

  } catch (error) {

    console.error(
      "PACKAGE PURCHASE ERROR:",
      error
    );

    return {

      success: false,

      message:
        "Something went wrong"

    };

  }

}
