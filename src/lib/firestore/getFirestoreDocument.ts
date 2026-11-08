import { getAdminDb } from "@/firebase/admin";

export async function getFirestoreDocument(
  collectionName: string,
  documentName: string
) {
  try {
    const snapshot = await getAdminDb()
      .collection(collectionName)
      .doc(documentName)
      .get();

    if (snapshot.exists) {
      return {
        success: true,
        data: snapshot.data() ?? null,
      };
    }

    return {
      success: false,
      data: null,
      error: "Document not found",
    };
  } catch (error) {
    console.error(
      `Firestore Admin read failed: ${collectionName}/${documentName}`,
      error
    );

    return {
      success: false,
      data: null,
      error,
    };
  }
}
