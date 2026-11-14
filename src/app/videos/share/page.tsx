import MonetagEarningsPage from "@/components/earnings/MonetagEarningsPage";

export const metadata = { title: "Sharer Earnings | JEMBEE PLAY" };

/** Backwards-compatible route for existing share-income links. */
export default function ShareIncomePage() {
  return <MonetagEarningsPage role="sharer" />;
}
