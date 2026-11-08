import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

export const sendFollowNotification = async (followerUid: string, targetUid: string, followerName: string) => {
  const notificationRef = doc(db, 'notifications', `${targetUid}_${followerUid}_${Date.now()}`);
  
  await setDoc(notificationRef, {
    recipientUid: targetUid,
    senderUid: followerUid,
    type: 'follow',
    message: `${followerName} started following you.`,
    read: false,
    timestamp: serverTimestamp()
  });
};
