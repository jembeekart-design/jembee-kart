import {
  doc,
  getDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

export async function getFirestoreDocument(
  collectionName: string,
  documentName: string
) {
  try {
    const documentReference = doc(
      db,
      collectionName,
      documentName
    );

    const documentSnapshot =
      await getDoc(documentReference);

    if (documentSnapshot.exists()) {
      return {
        success: true,

        data: documentSnapshot.data()
      };
    }

    return {
      success: false,

      data: null,

      error: "Document not found"
    };
  } catch (error) {
    return {
      success: false,

      data: null,

      error
    };
  }
}
