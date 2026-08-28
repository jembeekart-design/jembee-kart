import { db } from "@/firebase/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Interface for Withdrawal Configuration
 */
export interface WithdrawalSettings {
  minAmount: number;
  serviceFeePercent: number;
  isWithdrawalEnabled: boolean;
  maintenanceMessage: string;
  updatedAt: any;
}

const SETTINGS_REF = doc(db, "settings", "withdrawal");

/**
 * Fetch current withdrawal settings
 */
export async function getWithdrawalSettings(): Promise<WithdrawalSettings> {
  try {
    const docSnap = await getDoc(SETTINGS_REF);
    if (!docSnap.exists()) {
      return {
        minAmount: 200,
        serviceFeePercent: 0, // JembeeKart Recommended (Profit Model Alignment)
        isWithdrawalEnabled: true,
        maintenanceMessage: "",
        updatedAt: null
      };
    }
    return docSnap.data() as WithdrawalSettings;
  } catch (error) {
    console.error("GET_SETTINGS_ERROR:", error);
    throw new Error("Failed to fetch withdrawal settings");
  }
}

/**
 * Update withdrawal settings with Admin Authorization
 */
export async function updateWithdrawalSettings(
  adminId: string, 
  newSettings: Partial<WithdrawalSettings>
) {
  try {
    // 1. Admin Verification Logic
    // Placeholder: Fetch admin role from your 'admins' collection
    const adminRef = doc(db, "admins", adminId);
    const adminSnap = await getDoc(adminRef);
    
    if (!adminSnap.exists()) {
      throw new Error("UNAUTHORIZED: Admin access required");
    }

    // 2. SetDoc with merge:true prevents doc creation errors
    await setDoc(SETTINGS_REF, {
      ...newSettings,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return { success: true, message: "Settings updated successfully" };
  } catch (error: any) {
    console.error("UPDATE_SETTINGS_ERROR:", error.message);
    return { success: false, message: error.message };
  }
}
