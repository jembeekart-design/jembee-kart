// src/shared/firebase/storage.ts

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./config";

// 🔹 Upload Image
export const uploadImage = async (file: File, path: string) => {
  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);

  return await getDownloadURL(storageRef);
};

// 🔹 Product Image Upload
export const uploadProductImage = async (file: File) => {
  return uploadImage(file, "products");
};

// 🔹 Avatar Upload
export const uploadAvatar = async (file: File) => {
  return uploadImage(file, "users");
};