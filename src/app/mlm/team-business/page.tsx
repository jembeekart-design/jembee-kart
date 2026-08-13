"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "@/firebase/config";

interface TeamMember {
  id: string;
  name: string;
  business: number;
}

export default function TeamBusinessPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [totalBusiness, setTotalBusiness] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setTeamMembers([]);
        setTotalBusiness(0);
        setLoading(false);
        return;
      }

      try {
        // Current user's total team business
        const userSnap = await getDoc(doc(db, "users", user.uid));

        if (userSnap.exists()) {
          const userData = userSnap.data();

          setTotalBusiness(
            Number(userData.teamBusiness ?? userData.business ?? 0)
          );
        }

        // Direct team members
        const teamQuery = query(
          collection(db, "users"),
          where("sponsorId", "==", user.uid)
        );

        const teamSnap = await getDocs(teamQuery);

        const members: TeamMember[] = teamSnap.docs.map((memberDoc) => {
          const data = memberDoc.data();

          return {
            id: memberDoc.id,
            name:
              data.displayName ||
              data.name ||
              data.fullName ||
              data.username ||
              "User",
            business: Number(
              data.teamBusiness ?? data.business ?? data.totalBusiness ?? 0
            ),
          };
        });

        setTeamMembers(members);
      } catch (error) {
        console.error("Failed to load team business:", error);
        setTeamMembers([]);
        setTotalBusiness(0);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-card-background)] p-4">
        <p className="text-[var(--color-muted-text)]">
          Loading team business...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-card-background)] p-4">
      <h1 className="mb-5 text-3xl font-black">
        Team Business
      </h1>

      <div
        className="
          mb-5 rounded-3xl
          bg-gradient-to-r
          from-[var(--color-primary-button)]
          to-[var(--color-primary-button)]
          p-6
          text-[var(--color-button-text)]
        "
      >
        <p className="text-sm">
          Total Team Business
        </p>

        <h2 className="mt-2 text-4xl font-black">
          ₹{totalBusiness.toLocaleString("en-IN")}
        </h2>
      </div>

      <div className="space-y-4">
        {teamMembers.length === 0 ? (
          <div
            className="
              rounded-3xl
              bg-[var(--color-card-background)]
              p-5
              shadow-sm
            "
          >
            <p className="text-[var(--color-muted-text)]">
              No team members found.
            </p>
          </div>
        ) : (
          teamMembers.map((member) => (
            <div
              key={member.id}
              className="
                rounded-3xl
                bg-[var(--color-card-background)]
                p-5
                shadow-sm
              "
            >
              <div className="flex items-center justify-between">
                <h2 className="font-black">
                  {member.name}
                </h2>

                <p className="text-lg font-black text-[var(--color-primary-button)]">
                  ₹{member.business.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
