// src/lib/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA5PVW5tWBJrEKKL04UjkyZvSo6gNDPALfk",
  authDomain: "jembee-kart1.firebaseapp.com",
  projectId: "jembee-kart1",
  storageBucket: "jembee-kart1.appspot.com",
  messagingSenderId: "185822683860",
  appId: "1:185822683860:web:ab2df28d8fa60963365141",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
