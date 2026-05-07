import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import app from "@/config/firebase.config";

const auth = getAuth(app);

export const authService = {
  login: (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  },

  register: (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  },

  logout: () => {
    return signOut(auth);
  },
};

// THEME ADMIN PANEL SE CHANGE HOGA
