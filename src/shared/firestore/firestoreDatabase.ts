import { getFirestore } from "firebase/firestore";
import firebaseApp from "@/shared/firebase/firebaseApp";

const firestoreDatabase = getFirestore(firebaseApp);

export default firestoreDatabase;

// THEME ADMIN PANEL SE CHANGE HOGA
