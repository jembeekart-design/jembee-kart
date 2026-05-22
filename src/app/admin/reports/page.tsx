"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  collection,
  getDocs
} from "firebase/firestore";

import {
  BarChart3,
  IndianRupee,
  ShoppingBag,
  Users,
  Store,
  TrendingUp,
  Package,
  Wallet
} from "lucide-react";

import { db } from "@/firebase/config";

interface DashboardReport {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalWalletAmount: number;
}

export default function ReportsPage() {

  const [report, setReport] =
    useState<DashboardReport>({
      totalSales: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalSellers: 0,
      totalProducts: 0,
      totalWalletAmount: 0
    });

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchReports();

  }, []);

  async function fetchReports() {

    try {

      const [
        ordersSnap,
        usersSnap,
        sellersSnap,
        productsSnap
      ] = await Promise.all([
        getDocs(
          collection(db, "orders")
        ),
        getDocs(
          collection(db, "users")
        ),
        getDocs(
          collection(db, "sellers")
        ),
        getDocs(
          collection(db, "products")
        )
      ]);

      let sales = 0;

      let walletAmount = 0;

      ordersSnap.forEach((doc) => {

        const data = doc.data();

        sales += Number(
          data.amount || 0
        );

      });

      usersSnap.forEach((doc) => {

        const data = doc.data();

        walletAmount += Number(
          data.wallet || 0
        );

      });

      setReport({
        totalSales: sales,
        totalOrders:
          ordersSnap.size,
        totalUsers:
          usersSnap.size,
        totalSellers:
          sellersSnap.size,
        totalProducts:
          productsSnap.size,
        totalWalletAmount:
          walletAmount
      });

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-black text-white">

        Loading Reports...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-pink-500">

          <BarChart3 size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Reports & Analytics
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Platform analytics & business reports
          </p>

        </div>

      </div>

      {/* REPORT CARDS */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        <ReportCard
          title="Total Sales"
          value={`₹${report.totalSales}`}
          icon={
            <IndianRupee size={28} />
          }
        />

        <ReportCard
          title="Total Orders"
          value={
            report.totalOrders.toString()
          }
          icon={
            <ShoppingBag size={28} />
          }
        />

        <ReportCard
          title="Total Users"
          value={
            report.totalUsers.toString()
          }
          icon={
            <Users size={28} />
          }
        />

        <ReportCard
          title="Total Sellers"
          value={
            report.totalSellers.toString()
          }
          icon={
            <Store size={28} />
          }
        />

        <ReportCard
          title="Total Products"
          value={
            report.totalProducts.toString()
          }
          icon={
            <Package size={28} />
          }
        />

        <ReportCard
          title="Wallet Balance"
          value={`₹${report.totalWalletAmount}`}
          icon={
            <Wallet size={28} />
          }
        />

      </div>

      {/* BUSINESS OVERVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-pink-500 to-rose-500 p-6">

        <div className="flex items-center gap-3">

          <TrendingUp size={28} />

          <h2 className="text-3xl font-black">
            Business Overview
          </h2>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          <StatusCard
            title="Average Order Value"
            value={`₹${
              report.totalOrders > 0
                ? Math.floor(
                    report.totalSales /
                    report.totalOrders
                  )
                : 0
            }`}
          />

          <StatusCard
            title="Platform Growth"
            value="Growing"
          />

          <StatusCard
            title="Seller Network"
            value={`${report.totalSellers} Sellers`}
          />

          <StatusCard
            title="Inventory Size"
            value={`${report.totalProducts} Products`}
          />

        </div>

      </div>

    </main>

  );
}

function ReportCard({
  title,
  value,
  icon
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {

  return (

    <div className="rounded-[30px] bg-[#151515] p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-400">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-black">
            {value}
          </h2>

        </div>

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black">

          {icon}

        </div>

      </div>

    </div>

  );
}

function StatusCard({
  title,
  value
}: {
  title: string;
  value: string;
}) {

  return (

    <div className="rounded-2xl bg-white/10 p-5">

      <p className="text-sm text-white/70">
        {title}
      </p>

      <h3 className="mt-2 text-2xl font-black">
        {value}
      </h3>

    </div>

  );
}
