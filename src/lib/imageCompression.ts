// src/lib/imageCompression.ts

import imageCompression from "browser-image-compression";

// 🔥 Main compression function
export const compressImage = async (file: File): Promise<File> => {
  try {
    const options = {
      maxSizeMB: 0.3, // max 300kb
      maxWidthOrHeight: 800, // resize
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);

    return compressedFile;
  } catch (error) {
    console.error("Image compression error:", error);
    return file; // fallback original
  }
};

// 🖼 Convert file to preview URL
export const getImagePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

// 📦 Convert to base64 (for Firestore or API)
export const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
