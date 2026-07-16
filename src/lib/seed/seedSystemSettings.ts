import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export async function seedSystemSettings() {
  const docs = [
    {
      id: "global_config",
      data: {
        appName: "JembeeKart",
        maintenanceMode: false,
        environment: "production",
        version: "1.0.0",
      },
    },
    {
      id: "feature_flags",
      data: {
        ecommerce: true,
        referral: true,
        mlm: true,
        wallet: true,
        watchEarn: true,
        creatorEconomy: true,
        cashback: true,
        coinSystem: true,
        loyaltyProgram: true,
        sellerModule: true,
        advertisement: true,
        affiliate: true,
      },
    },
    {
      id: "theme",
      data: {
        primaryColor: "#22c55e",
        secondaryColor: "#16a34a",
        backgroundColor: "#ffffff",
        cardColor: "#ffffff",
        textColor: "#111827",
        borderColor: "#e5e7eb",
        buttonColor: "#22c55e",
        buttonTextColor: "#ffffff",
      },
    },
    {
      id: "wallet",
      data: {},
    },
    {
      id: "mlm",
      data: {},
    },
    {
      id: "watch_earn",
      data: {},
    },
    {
      id: "homepage",
      data: {},
    },
    {
      id: "security",
      data: {},
    },
    {
      id: "version",
      data: {},
    },
  ];

  for (const item of docs) {
    const ref = doc(db, "settings", item.id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, item.data);
      console.log(`Created settings/${item.id}`);
    }
  }
}
