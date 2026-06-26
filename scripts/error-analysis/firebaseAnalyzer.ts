/**
 * ==========================================================
 * AI Error Analysis System
 * Firebase / Firestore Analyzer
 * ==========================================================
 */

import { ParsedError } from "./buildLogParser";

export interface FirebaseError extends ParsedError {
  category:
    | "AUTH"
    | "FIRESTORE"
    | "STORAGE"
    | "FUNCTIONS"
    | "PERMISSION"
    | "NETWORK"
    | "CONFIG"
    | "UNKNOWN";

  firebaseCode?: string;

  rootCause?: string;

  suggestedFix?: string;

  buildBlocking: boolean;
}

export function analyzeFirebase(
  errors: ParsedError[]
): FirebaseError[] {

  const firebaseErrors = errors.filter(error => {

    const msg = error.message.toLowerCase();

    return (
      error.source === "FIREBASE" ||

      msg.includes("firebase") ||

      msg.includes("firestore") ||

      msg.includes("auth/") ||

      msg.includes("storage/") ||

      msg.includes("permission-denied") ||

      msg.includes("failed-precondition") ||

      msg.includes("functions")
    );

  });

  return firebaseErrors.map(error => {

    let category: FirebaseError["category"] = "UNKNOWN";

    let firebaseCode: string | undefined;

    let rootCause = "Unknown Firebase error.";

    let suggestedFix = "Inspect Firebase configuration.";

    let buildBlocking = false;

    //------------------------------------------------------
    // Firebase Error Code
    //------------------------------------------------------

    const code = error.message.match(
      /([a-z-]+\/[a-z-]+)/i
    );

    if (code) {
      firebaseCode = code[1];
    }

    //------------------------------------------------------
    // AUTH
    //------------------------------------------------------

    if (
      firebaseCode?.startsWith("auth/")
    ) {

      category = "AUTH";

      buildBlocking = true;

      switch (firebaseCode) {

        case "auth/invalid-api-key":

          rootCause =
            "Invalid Firebase API Key.";

          suggestedFix =
            "Verify NEXT_PUBLIC_FIREBASE_API_KEY.";

          break;

        case "auth/user-not-found":

          rootCause =
            "User document not found.";

          suggestedFix =
            "Validate authentication flow.";

          break;

        case "auth/network-request-failed":

          rootCause =
            "Network failure.";

          suggestedFix =
            "Check internet or Firebase availability.";

          break;

        default:

          rootCause =
            "Firebase Authentication failed.";

          suggestedFix =
            "Review Firebase Auth configuration.";

      }

    }

    //------------------------------------------------------
    // Firestore
    //------------------------------------------------------

    else if (

      error.message.includes("Firestore") ||

      firebaseCode?.startsWith("firestore/")

    ) {

      category = "FIRESTORE";

      buildBlocking = true;

      rootCause =
        "Firestore operation failed.";

      suggestedFix =
        "Verify collection, document path and indexes.";

    }

    //------------------------------------------------------
    // Storage
    //------------------------------------------------------

    else if (

      firebaseCode?.startsWith("storage/")

    ) {

      category = "STORAGE";

      rootCause =
        "Firebase Storage error.";

      suggestedFix =
        "Verify bucket permissions.";

    }

    //------------------------------------------------------
    // Functions
    //------------------------------------------------------

    else if (

      error.message.includes("Cloud Function") ||

      error.message.includes("functions")

    ) {

      category = "FUNCTIONS";

      rootCause =
        "Cloud Function execution failed.";

      suggestedFix =
        "Inspect Firebase Function logs.";

    }

    //------------------------------------------------------
    // Permission
    //------------------------------------------------------

    else if (

      error.message.includes("permission-denied")

    ) {

      category = "PERMISSION";

      rootCause =
        "Firestore Security Rules blocked access.";

      suggestedFix =
        "Review firestore.rules.";

    }

    //------------------------------------------------------
    // Network
    //------------------------------------------------------

    else if (

      error.message.includes("network")

    ) {

      category = "NETWORK";

      rootCause =
        "Unable to connect to Firebase.";

      suggestedFix =
        "Verify internet and Firebase status.";

    }

    //------------------------------------------------------
    // Config
    //------------------------------------------------------

    else if (

      error.message.includes("api key") ||

      error.message.includes("project id") ||

      error.message.includes("app initialization")

    ) {

      category = "CONFIG";

      buildBlocking = true;

      rootCause =
        "Firebase configuration is invalid.";

      suggestedFix =
        "Check firebaseConfig and environment variables.";

    }

    return {

      ...error,

      category,

      firebaseCode,

      rootCause,

      suggestedFix,

      buildBlocking

    };

  });

}
