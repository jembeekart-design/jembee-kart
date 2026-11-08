import { db } from "@/firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export interface RewardRepository {
  readonly recordRewardedVideo: (uid: string, videoId: string) => Promise<void>;
}

export const rewardRepository: RewardRepository = {
  recordRewardedVideo: async (uid: string, videoId: string) => {
    const rewardRef = doc(db, "users", uid, "rewardedVideos", videoId);
    await setDoc(rewardRef, {
      videoId,
      uid,
      createdAt: serverTimestamp(),
    });
  },
};
