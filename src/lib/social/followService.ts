import { 
  doc, 
  runTransaction, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { sendFollowNotification } from './notificationService';

export const followUser = async (followerUid: string, targetUid: string, followerName: string) => {
  if (followerUid === targetUid) throw new Error("Cannot follow yourself");

  const followerRef = doc(db, 'users', followerUid);
  const targetRef = doc(db, 'users', targetUid);
  const followRef = doc(collection(db, 'users', targetUid, 'followers'), followerUid);
  const followingRef = doc(collection(db, 'users', followerUid, 'following'), targetUid);

  await runTransaction(db, async (transaction) => {
    const followDoc = await transaction.get(followRef);
    if (followDoc.exists()) throw new Error("Already following");

    transaction.set(followRef, { uid: followerUid, timestamp: new Date() });
    transaction.set(followingRef, { uid: targetUid, timestamp: new Date() });
    transaction.update(followerRef, { followingCount: (await transaction.get(followerRef)).data()?.followingCount + 1 || 1 });
    transaction.update(targetRef, { followersCount: (await transaction.get(targetRef)).data()?.followersCount + 1 || 1 });
  });

  await sendFollowNotification(followerUid, targetUid, followerName);
};
...

export const unfollowUser = async (followerUid: string, targetUid: string) => {
  const followerRef = doc(db, 'users', followerUid);
  const targetRef = doc(db, 'users', targetUid);
  const followRef = doc(collection(db, 'users', targetUid, 'followers'), followerUid);
  const followingRef = doc(collection(db, 'users', followerUid, 'following'), targetUid);

  await runTransaction(db, async (transaction) => {
    transaction.delete(followRef);
    transaction.delete(followingRef);
    transaction.update(followerRef, { followingCount: Math.max(0, (await transaction.get(followerRef)).data()?.followingCount - 1 || 0) });
    transaction.update(targetRef, { followersCount: Math.max(0, (await transaction.get(targetRef)).data()?.followersCount - 1 || 0) });
  });
};

export const isFollowing = async (followerUid: string, targetUid: string): Promise<boolean> => {
  const followRef = doc(collection(db, 'users', targetUid, 'followers'), followerUid);
  const followDoc = await getDoc(followRef);
  return followDoc.exists();
};
