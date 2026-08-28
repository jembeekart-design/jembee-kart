import { doc, increment } from "firebase/firestore";
import { db } from "@/firebase/config";

export async function updateSponsorCounters(
  transaction: any,
  sponsorUid: string
) {
  if (!sponsorUid) return;

  const sponsorRef = doc(db, "users", sponsorUid);
  const sponsorSnap = await transaction.get(sponsorRef);

  if (!sponsorSnap.exists()) return;

  transaction.update(sponsorRef, {
    totalReferrals: increment(1),
    directReferrals: increment(1),
  });
}
