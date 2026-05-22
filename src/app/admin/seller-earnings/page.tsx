"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  collection,
  getDocs
} from "firebase/firestore";

import {
  Store,
  IndianRupee,
  Wallet,
  TrendingUp,
  BadgeDollarSign
} from "lucide-react";

import { db } from "@/firebase/config";

interface SellerData {
  id?: string;
  sellerName: string;
  totalSales: number;
  totalOrders: number;
  earnings: number;
  withdrawn: number;
}

export default function SellerEarningsPage() {

  const [sellers, setSellers] =
    useState<SellerData[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchSellerData();

  }, []);

  async function fetchSellerData() {

    try {

      const snapshot =
        await getDocs(
          collection(
            db,
            "seller_earnings"
          )
        );

      const data:
        SellerData[] = [];

      snapshot.forEach((doc) => {

        data.push({
          id: doc.id,
          ...doc.data()
        } as SellerData);

      });

      setSellers(data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  }

  function calculateTotalRevenue() {

    return sellers.reduce(
      (
        total,
        seller
      ) =>
        total +
        seller.earnings,
      0
    );

  }

  function calculateWithdrawn() {

    return sellers.reduce(
      (
        total,
        seller
      ) =>
        total +
        seller.withdrawn,
      0
    );

  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-black text-white">

        Loading Seller Earnings...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-emerald-500">

          <Store size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Seller Earnings
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Track seller income & withdrawals
          </p>

        </div>

      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        <StatsCard
          title="Total Seller Revenue"
          value={`₹${calculateTotalRevenue()}`}
          icon={
            <IndianRupee size={24} />
          }
          color="from-green-500 to-emerald-500"
        />

        <StatsCard
          title="Total Withdrawn"
          value={`₹${calculateWithdrawn()}`}
          icon={
            <Wallet size={24} />
          }
          color="from-red-500 to-rose-500"
        />

        <StatsCard
          title="Active Sellers"
          value={sellers.length}
          icon={
            <TrendingUp size={24} />
          }
          color="from-blue-500 to-cyan-500"
        />

      </div>

      {/* SELLERS */}

      <div className="mt-6 space-y-5">

        {sellers.length === 0 && (

          <div className="rounded-[30px] bg-[#151515] p-10 text-center">

            No Seller Earnings Found

          </div>

        )}

        {sellers.map(
          (seller) => (

            <div
              key={seller.id}
              className="rounded-[30px] bg-[#151515] p-5"
            >

              <div className="flex flex-col gap-6">

                {/* TOP */}

                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                  <div>

                    <div className="flex items-center gap-3">

                      <Store size={20} />

                      <h2 className="text-2xl font-black text-emerald-400">

                        {
                          seller.sellerName
                        }

                      </h2>

                    </div>

                    <p className="mt-2 text-sm text-gray-400">

                      Seller Earnings Overview

                    </p>

                  </div>

                  <div className="rounded-full bg-green-500 px-5 py-3 text-sm font-bold text-black">

                    Active Seller

                  </div>

                </div>

                {/* CARDS */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

                  <MiniCard
                    title="Sales"
                    value={`₹${seller.totalSales}`}
                  />

                  <MiniCard
                    title="Orders"
                    value={
                      seller.totalOrders
                    }
                  />

                  <MiniCard
                    title="Earnings"
                    value={`₹${seller.earnings}`}
                  />

                  <MiniCard
                    title="Withdrawn"
                    value={`₹${seller.withdrawn}`}
                  />

                </div>

                {/* PROFIT */}

                <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 p-5">

                  <div className="flex items-center gap-3">

                    <BadgeDollarSign size={24} />

                    <h3 className="text-2xl font-black text-black">

                      Remaining Balance:
                      {" "}
                      ₹
                      {seller.earnings -
                        seller.withdrawn}

                    </h3>

                  </div>

                </div>

              </div>

            </div>

          )
        )}

      </div>

    </main>

  );
}

function StatsCard({
  title,
  value,
  icon,
  color
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {

  return (

    <div
      className={`rounded-[30px] bg-gradient-to-r ${color} p-5`}
    >

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-white/80">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-black">
            {value}
          </h2>

        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">

          {icon}

        </div>

      </div>

    </div>

  );
}

function MiniCard({
  title,
  value
}: {
  title: string;
  value: string | number;
}) {

  return (

    <div className="rounded-2xl bg-black/30 p-4">

      <p className="text-sm text-gray-400">
        {title}
      </p>

      <h3 className="mt-2 text-2xl font-black">
        {value}
      </h3>

    </div>

  );
}
