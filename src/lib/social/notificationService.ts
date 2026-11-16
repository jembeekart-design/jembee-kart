import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

export const sendFollowNotification = async (followerUid: string, targetUid: string, followerName: string) => {
  // Stable identity makes retries idempotent instead of creating duplicate notifications.
  const notificationRef = doc(db, 'notifications', `follow_${targetUid}_${followerUid}`);
  
  await setDoc(notificationRef, {
    recipientUid: targetUid,
    senderUid: followerUid,
    type: 'follow',
    message: `${followerName} started following you.`,
    read: false,
    timestamp: serverTimestamp()
  }, { merge: true });
};
