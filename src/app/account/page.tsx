"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { uploadToCloudinary } from "@/lib/cloudinary";

import {
  ChevronRight,
  CreditCard,
  Gift,
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  Shield,
  User,
  Wallet,
  Camera
} from "lucide-react";

import Header from "@/components/navigation/Header";
import BottomNavbar from "@/components/navigation/BottomNavbar";
import WhatsAppButton from "@/components/navigation/WhatsAppButton";
import Avatar from "@/components/user/Avatar";
import { useAdminConfig } from "@/lib/admin-config/provider";
/* ======================================================
TYPES
====================================================== */
interface UserProfile {
  uid: string;
  email: string;
  name: string;
  photo: string;
  phone?: string;
  walletBalance: number;
  totalIncome: number;
  mlmActive: boolean;
  referralCode: string;
  sponsorId: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  uploadedVideosCount: number;
}

/* ======================================================
COMPONENT
====================================================== */
export default function AccountPage() {
  const { config } = useAdminConfig();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ======================================================
  AUTH STATE & FIRESTORE REALTIME SYNC (FIXED CLEANUP)
  ====================================================== */
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        setLoading(false);
        return;
      }

      const docRef = doc(db, "users", currentUser.uid);

      unsubscribeFirestore = onSnapshot(
      docRef,
      (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUser({
          uid: data.uid || currentUser.uid,
          email: data.email || "",
          name: data.displayName || data.name || currentUser.displayName || "JembeeKart User",
          photo: data.photoURL || data.photo || currentUser.photoURL || "",
          phone: data.phone || "",
          walletBalance: data.walletBalance || 0,
          totalIncome: data.totalIncome || 0,
          mlmActive: data.mlmActive || false,
          referralCode: data.referralCode || "",
          sponsorId: data.sponsorId || "",
          bio: data.bio || "",
          followersCount: data.followersCount || 0,
          followingCount: data.followingCount || 0,
          uploadedVideosCount: data.uploadedVideosCount || 0
        });
      } else {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email || "",
          name: currentUser.displayName || "JembeeKart User",
          photo: currentUser.photoURL || "",
          phone: currentUser.phoneNumber || "",
          walletBalance: 0,
          totalIncome: 0,
          mlmActive: false,
          referralCode: "",
          sponsorId: "",
          bio: "",
          followersCount: 0,
          followingCount: 0,
          uploadedVideosCount: 0
        });
      }
      setLoading(false);
      },
      (error) => {
        console.error("Firestore onSnapshot error:", error);
        setLoading(false);
      }
      );

    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [router]);

  /* ======================================================
  PHOTO UPLOAD
  ====================================================== */
  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    
    const file = e.target.files[0];
    setUploading(true);
    
    try {
      const cloudinaryResponse = await uploadToCloudinary(file, "image");
      const photoURL = cloudinaryResponse.secure_url;
      
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { photoURL });
      
      // UI update is handled automatically by onSnapshot
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload profile photo.");
    } finally {
      setUploading(false);
    }
  }

  /* ======================================================
  LOGOUT FUNCTION
  ====================================================== */
  async function handleLogout() {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout Error:", error);
    }
  }

  /* ======================================================
  MENU ITEMS
  ====================================================== */
  const menuItems = [
    {
      title: "My Orders",
      icon: Package,
      href: "/orders",
      color: "bg-[var(--color-primary-button)] text-[var(--color-primary-button)]"
    },
    {
      title: "Wishlist",
      icon: Heart,
      href: "/wishlist",
      color: "bg-[var(--color-primary-button)] text-[var(--color-primary-button)]"
    },
    {
      title: "Saved Address",
      icon: MapPin,
      href: "/address",
      color: "bg-[var(--color-warning)] text-[var(--color-warning)]"
    },
    {
      title: "Affiliate Dashboard",
      icon: Gift,
      href: "/affiliate",
      color: "bg-[var(--color-primary-button)] text-[var(--color-primary-button)]"
    },
    {
      title: "Account Settings",
      icon: Settings,
      href: "/settings",
      color: "bg-[var(--color-page-background)] text-[var(--text-primary)]"
    }
  ];

  /* ======================================================
  LOADING STATE UI
  ====================================================== */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-page-background)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary-button)] mx-auto"></div>
          <p className="mt-4 text-sm font-bold text-[var(--text-secondary)]">Syncing Profile Details...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--color-page-background)] pb-32 pt-[115px] md:pt-[150px]">
      <Header />

      {/* ======================================================
      PAGE TITLE
      ====================================================== */}
      <section className="px-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)]">My Account</h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Manage your profile & orders</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--color-primary-button)] to-[var(--color-primary-button)] text-[var(--button-text-color)] shadow-lg">
            <User size={26} />
          </div>
        </div>
      </section>

      {/* ======================================================
      PROFILE CARD
      ====================================================== */}
      <section className="mt-6 px-4">
        <div className="overflow-hidden rounded-[35px] bg-gradient-to-br from-[var(--color-primary-button)] via-[var(--color-primary-button)] to-[var(--color-primary-button)] p-6 text-[var(--button-text-color)] shadow-2xl">
          <div className="flex items-center gap-4">
            
            {/* AVATAR / PROFILE PIC */}
            <div className="relative">
              <Avatar name={user?.name || ""} photoUrl={user?.photo} />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-[var(--color-card-background)] rounded-full text-[var(--button-text-color)] shadow-lg"
                disabled={uploading}
              >
                {uploading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Camera size={16} />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoChange} 
                className="hidden"
                accept="image/*"
              />
            </div>

            {/* USER INFO */}
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-2xl font-black">{user?.name}</h2>
              <p className="mt-1 text-sm text-[var(--button-text-color)]/80">{user?.bio || "No bio yet."}</p>
              
              <div className="flex gap-4 mt-2">
                <p className="text-sm">
                  <span className="font-black">{user?.followersCount}</span> Followers
                </p>
                <p className="text-sm">
                  <span className="font-black">{user?.followingCount}</span> Following
                </p>
                <p className="text-sm">
                  <span className="font-black">{user?.uploadedVideosCount}</span> Videos
                </p>
              </div>
            </div>
          </div>

          {/* WALLET BALANCE */}
          <div className="mt-6 rounded-3xl bg-[var(--color-card-background)]/15 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--button-text-color)]/80">Wallet Balance</p>
                <h3 className="mt-2 text-4xl font-black">
                  ₹{user?.walletBalance || 0}
                </h3>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-card-background)]/20">
                <Wallet size={30} />
              </div>
            </div>
          </div>

          {/* MLM STATUS */}
          <div className="mt-4 rounded-3xl bg-[var(--color-card-background)]/15 p-5 backdrop-blur-md">
            <p className="text-sm font-semibold text-[var(--button-text-color)]/80">
              MLM Status
            </p>
            <h3 className="mt-2 text-xl font-black">
              {user?.mlmActive ? "ACTIVE" : "INACTIVE"}
            </h3>
          </div>

          {/* REFERRAL CODE */}
          <div className="mt-4 rounded-3xl bg-[var(--color-card-background)]/15 p-5 backdrop-blur-md">
            <p className="text-sm font-semibold text-[var(--button-text-color)]/80">
              Referral Code
            </p>
            <h3 className="mt-2 text-xl font-black">
              {user?.referralCode || "LOCKED"}
            </h3>
          </div>

        </div>
      </section>

      {/* ======================================================
      MENU SECTION
      ====================================================== */}
      <section className="mt-6 px-4">
        <div className="space-y-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center justify-between rounded-[30px] bg-[var(--color-card-background)] p-5 shadow-sm transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.color}`}>
                    <Icon size={26} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[var(--text-primary)]">{item.title}</h3>
                  </div>
                </div>
                <ChevronRight size={22} className="text-[var(--text-secondary)]" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ======================================================
      SECURITY CARD
      ====================================================== */}
      <section className="mt-6 px-4">
        <div className="rounded-[35px] bg-[var(--color-card-background)] p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--color-success)] text-[var(--color-success)]">
              <Shield size={30} />
            </div>
            <div>
              <h3 className="text-xl font-black text-[var(--text-primary)]">Account Secure</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Your account is protected via Firebase</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
      LOGOUT BUTTON
      ====================================================== */}
      <section className="mt-6 px-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-3 rounded-[30px] bg-[var(--color-danger)] py-5 text-sm font-black text-[var(--button-text-color)] shadow-xl shadow transition-all duration-300 hover:scale-[1.02]"
        >
          <LogOut size={20} />
          Logout
        </button>
      </section>

      {/* FLOATING BUTTONS */}
      <WhatsAppButton />
      <BottomNavbar />
    </main>
  );
}

