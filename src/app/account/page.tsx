"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

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
  Wallet
} from "lucide-react";

import Header from "@/components/navigation/Header";
import BottomNavbar from "@/components/navigation/BottomNavbar";
import WhatsAppButton from "@/components/navigation/WhatsAppButton";

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
}

/* ======================================================
COMPONENT
====================================================== */
export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

      unsubscribeFirestore = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUser({
            uid: data.uid || currentUser.uid,
            email: data.email || "",
            name: data.name || "",
            photo: data.photo || "",
            phone: data.phone || "",
            walletBalance: data.walletBalance || 0,
            totalIncome: data.totalIncome || 0,
            mlmActive: data.mlmActive || false,
            referralCode: data.referralCode || "",
            sponsorId: data.sponsorId || ""
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
            sponsorId: ""
          });
        }
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [router]);

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
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      title: "Wishlist",
      icon: Heart,
      href: "/wishlist",
      color: "bg-pink-100 text-pink-600"
    },
    {
      title: "Saved Address",
      icon: MapPin,
      href: "/address",
      color: "bg-orange-100 text-orange-600"
    },
    {
      title: "Affiliate Dashboard",
      icon: Gift,
      href: "/affiliate",
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Payment Methods",
      icon: CreditCard,
      href: "/payments",
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Account Settings",
      icon: Settings,
      href: "/settings",
      color: "bg-[var(--background-color)] text-[var(--text-color)]"
    }
  ];

  /* ======================================================
  LOADING STATE UI
  ====================================================== */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7fb]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-sm font-bold text-[var(--muted-text-color)]">Syncing Profile Details...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f7fb] pb-32 pt-[115px] md:pt-[150px]">
      <Header />

      {/* ======================================================
      PAGE TITLE
      ====================================================== */}
      <section className="px-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-[var(--text-color)]">My Account</h1>
            <p className="mt-1 text-sm text-[var(--muted-text-color)]">Manage your profile & orders</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 text-[var(--button-text-color)] shadow-lg">
            <User size={26} />
          </div>
        </div>
      </section>

      {/* ======================================================
      PROFILE CARD
      ====================================================== */}
      <section className="mt-6 px-4">
        <div className="overflow-hidden rounded-[35px] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-[var(--button-text-color)] shadow-2xl">
          <div className="flex items-center gap-4">
            
            {/* AVATAR / PROFILE PIC */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/30 bg-[var(--card-color)]/20 overflow-hidden text-3xl font-black backdrop-blur-md">
              {user?.photo ? (
                <img src={user.photo} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>

            {/* USER INFO */}
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-2xl font-black">{user?.name}</h2>
              <p className="mt-1 truncate text-sm text-[var(--button-text-color)]/80">{user?.email}</p>
              {user?.phone && (
                <p className="mt-1 text-sm text-[var(--button-text-color)]/80">{user.phone}</p>
              )}
            </div>
          </div>

          {/* WALLET BALANCE */}
          <div className="mt-6 rounded-3xl bg-[var(--card-color)]/15 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--button-text-color)]/80">Wallet Balance</p>
                <h3 className="mt-2 text-4xl font-black">
                  ₹{user?.walletBalance || 0}
                </h3>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--card-color)]/20">
                <Wallet size={30} />
              </div>
            </div>
          </div>

          {/* MLM STATUS */}
          <div className="mt-4 rounded-3xl bg-[var(--card-color)]/15 p-5 backdrop-blur-md">
            <p className="text-sm font-semibold text-[var(--button-text-color)]/80">
              MLM Status
            </p>
            <h3 className="mt-2 text-xl font-black">
              {user?.mlmActive ? "ACTIVE" : "INACTIVE"}
            </h3>
          </div>

          {/* REFERRAL CODE */}
          <div className="mt-4 rounded-3xl bg-[var(--card-color)]/15 p-5 backdrop-blur-md">
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
                className="flex items-center justify-between rounded-[30px] bg-[var(--card-color)] p-5 shadow-sm transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.color}`}>
                    <Icon size={26} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[var(--text-color)]">{item.title}</h3>
                  </div>
                </div>
                <ChevronRight size={22} className="text-gray-400" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ======================================================
      SECURITY CARD
      ====================================================== */}
      <section className="mt-6 px-4">
        <div className="rounded-[35px] bg-[var(--card-color)] p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-green-100 text-green-600">
              <Shield size={30} />
            </div>
            <div>
              <h3 className="text-xl font-black text-[var(--text-color)]">Account Secure</h3>
              <p className="mt-1 text-sm text-[var(--muted-text-color)]">Your account is protected via Firebase</p>
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
          className="flex w-full items-center justify-center gap-3 rounded-[30px] bg-[var(--danger-color)] py-5 text-sm font-black text-[var(--button-text-color)] shadow-xl shadow-red-500/20 transition-all duration-300 hover:scale-[1.02]"
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
