// src/shared/firebase/storage.ts

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import { storage } from "./config";

/* =========================================================
   🔐 SAFE UPLOAD SYSTEM (TEMP → PROCESS → FINAL)
========================================================= */

// 🔹 Upload to TEMP (user safe zone)
export const uploadTempFile = async (file: File, userId: string) => {
  try {
    const filePath = `temp/uploads/${userId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, file);

    const url = await getDownloadURL(storageRef);

    return {
      url,
      path: filePath,
    };
  } catch (error) {
    console.error("Temp Upload Error:", error);
    throw error;
  }
};

/* =========================================================
   📦 PRODUCT IMAGE (ADMIN ONLY)
========================================================= */

export const uploadProductImage = async (file: File) => {
  try {
    const filePath = `images/products/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, file);

    const url = await getDownloadURL(storageRef);

    return {
      url,
      path: filePath,
    };
  } catch (error) {
    console.error("Product Upload Error:", error);
    throw error;
  }
};

/* =========================================================
   👤 USER AVATAR SYSTEM
========================================================= */

export const uploadUserAvatar = async (
  file: File,
  userId: string
) => {
  try {
    const filePath = `images/users/${userId}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, file);

    const url = await getDownloadURL(storageRef);

    return {
      url,
      path: filePath,
    };
  } catch (error) {
    console.error("Avatar Upload Error:", error);
    throw error;
  }
};

/* =========================================================
   🎨 BANNER SYSTEM (ADMIN)
========================================================= */

export const uploadBanner = async (file: File) => {
  try {
    const filePath = `images/banners/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, file);

    const url = await getDownloadURL(storageRef);

    return {
      url,
      path: filePath,
    };
  } catch (error) {
    console.error("Banner Upload Error:", error);
    throw error;
  }
};

/* =========================================================
   🧹 DELETE FILE (ADMIN / OWNER)
========================================================= */

export const deleteFile = async (filePath: string) => {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    console.error("Delete Error:", error);
    throw error;
  }
};

/* =========================================================
   📂 LIST FILES (FOR ADMIN PANEL)
========================================================= */

export const listFiles = async (folderPath: string) => {
  try {
    const folderRef = ref(storage, folderPath);
    const res = await listAll(folderRef);

    const files = await Promise.all(
      res.items.map(async (item) => {
        const url = await getDownloadURL(item);
        return {
          name: item.name,
          fullPath: item.fullPath,
          url,
        };
      })
    );

    return files;
  } catch (error) {
    console.error("List Files Error:", error);
    throw error;
  }
};

/* =========================================================
   ⚡ OPTIMIZATION PLACEHOLDER (Future)
========================================================= */

// 👉 Future: image compression, resizing, AI tagging
export const processImage = async (file: File) => {
  // placeholder
  return file;
};