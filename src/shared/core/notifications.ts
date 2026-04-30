import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export const sendNotification = async (userId: string, message: string) => {
  return addDoc(collection(db, "notifications"), {
    userId,
    message,
    read: false,
    createdAt: Date.now(),
  });
};