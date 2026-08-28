import { db } from "@/firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";

async function updateAndVerify() {
  const mlmRef = doc(db, "settings", "mlm");
  const data = {
    enabled: true,
    level1: 5,
    level2: 2,
    level3: 0,
    maxLevels: 2
  };

  console.log("Updating Firestore document settings/mlm...");
  await setDoc(mlmRef, data);
  
  console.log("Verifying document values...");
  const snap = await getDoc(mlmRef);
  if (snap.exists()) {
    console.log("Verified Data:", JSON.stringify(snap.data()));
  } else {
    console.error("Document not found after write!");
    process.exit(1);
  }
}

updateAndVerify().catch((e) => { console.error(e); process.exit(1); });
