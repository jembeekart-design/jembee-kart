import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

// 🔹 Add Address
export const addAddress = async (uid: string, address: any) => {
  return addDoc(collection(db, `users/${uid}/addresses`), address);
};

// 🔹 Get Addresses
export const getAddresses = async (uid: string) => {
  const snap = await getDocs(collection(db, `users/${uid}/addresses`));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};