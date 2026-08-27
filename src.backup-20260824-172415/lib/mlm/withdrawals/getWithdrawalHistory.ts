import { db } from "@/firebase/config";
import { collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";

/**
 * Enterprise Withdrawal History Fetcher
 * Optimized for Admin and User panels
 */
export async function getWithdrawalHistory(
  userId?: string, 
  limitCount: number = 20,
  status?: string
) {
  try {
    // 1. Safe Limit Validation (1 to 100)
    const safeLimit = Math.min(Math.max(limitCount, 1), 100);
    
    const withdrawsCollection = collection(db, "withdraws");
    
    // 2. Dynamic Query Construction
    let q = query(withdrawsCollection, orderBy("createdAt", "desc"));

    // Filter by User
    if (userId) {
      q = query(q, where("userId", "==", userId));
    }

    // Filter by Status (Pending, Completed, Rejected)
    if (status) {
      q = query(q, where("status", "==", status));
    }

    // Apply Limit
    q = query(q, limit(safeLimit));

    const querySnapshot = await getDocs(q);
    
    const history = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Detailed Audit Timestamps
        createdAt: data.createdAt?.toDate() || null,
        approvedAt: data.approvedAt?.toDate() || null,
        rejectedAt: data.rejectedAt?.toDate() || null,
      };
    });

    return { success: true, data: history };

  } catch (error: any) {
    console.error("HISTORY_FETCH_ERROR:", error.message);
    return { success: false, message: "Failed to load history" };
  }
}
