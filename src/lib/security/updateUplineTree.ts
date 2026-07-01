import { doc, increment } from "firebase/firestore";
import { db } from "@/firebase/config";

export async function updateUplineTree(
  transaction: any,
  newUserParentChain: string[]
) {
  for (const uplineId of newUserParentChain) {
    const cleanUplineId = uplineId?.trim();

    if (!cleanUplineId) continue;

    const uplineRef = doc(db, "users", cleanUplineId);
    const uplineSnap = await transaction.get(uplineRef);

    if (uplineSnap.exists()) {
      transaction.update(uplineRef, {
        teamSize: increment(1),
      });
    }
  }
}
