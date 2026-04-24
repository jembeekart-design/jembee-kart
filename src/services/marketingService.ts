// src/services/marketingService.ts

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/* ===========================
   🎉 FESTIVAL BANNERS
=========================== */

const bannerRef = collection(db, "banners");

// ➕ Add banner
export const addBanner = async (data: any) => {
  const docRef = await addDoc(bannerRef, {
    ...data,
    createdAt: new Date(),
  });
  return docRef.id;
};

// 📄 Get banners
export const getBanners = async () => {
  const snapshot = await getDocs(bannerRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// 🔍 Get banner by ID
export const getBannerById = async (id: string) => {
  const docRef = doc(db, "banners", id);
  const snap = await getDoc(docRef);

  if (!snap.exists()) throw new Error("Banner not found");

  return {
    id: snap.id,
    ...snap.data(),
  };
};

// ✏️ Update banner
export const updateBanner = async (id: string, data: any) => {
  const docRef = doc(db, "banners", id);

  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date(),
  });
};

// ❌ Delete banner
export const deleteBanner = async (id: string) => {
  const docRef = doc(db, "banners", id);
  await deleteDoc(docRef);
};

/* ===========================
   ⚡ FLASH SALE
=========================== */

const flashRef = collection(db, "flash_sales");

// ➕ Add flash sale
export const addFlashSale = async (data: any) => {
  const docRef = await addDoc(flashRef, {
    ...data,
    createdAt: new Date(),
  });
  return docRef.id;
};

// 📄 Get flash sales
export const getFlashSales = async () => {
  const snapshot = await getDocs(flashRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// 🔍 Get flash sale
export const getFlashSaleById = async (id: string) => {
  const docRef = doc(db, "flash_sales", id);
  const snap = await getDoc(docRef);

  if (!snap.exists()) throw new Error("Flash sale not found");

  return {
    id: snap.id,
    ...snap.data(),
  };
};

// ✏️ Update flash sale
export const updateFlashSale = async (
  id: string,
  data: any
) => {
  const docRef = doc(db, "flash_sales", id);

  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date(),
  });
};

// ❌ Delete flash sale
export const deleteFlashSale = async (id: string) => {
  const docRef = doc(db, "flash_sales", id);
  await deleteDoc(docRef);
};

/* ===========================
   🎟 OFFERS / COUPONS
=========================== */

const offerRef = collection(db, "offers");

// ➕ Add offer
export const addOffer = async (data: any) => {
  const docRef = await addDoc(offerRef, {
    ...data,
    createdAt: new Date(),
  });
  return docRef.id;
};

// 📄 Get offers
export const getOffers = async () => {
  const snapshot = await getDocs(offerRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// 🔍 Get offer
export const getOfferById = async (id: string) => {
  const docRef = doc(db, "offers", id);
  const snap = await getDoc(docRef);

  if (!snap.exists()) throw new Error("Offer not found");

  return {
    id: snap.id,
    ...snap.data(),
  };
};

// ✏️ Update offer
export const updateOffer = async (id: string, data: any) => {
  const docRef = doc(db, "offers", id);

  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date(),
  });
};

// ❌ Delete offer
export const deleteOffer = async (id: string) => {
  const docRef = doc(db, "offers", id);
  await deleteDoc(docRef);
};
