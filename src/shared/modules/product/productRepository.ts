import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

export const saveProduct = async (p: any) => {
  const ref = await addDoc(collection(db, "products"), p);
  return { id: ref.id, ...p };
};

export const fetchProducts = async () => {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};