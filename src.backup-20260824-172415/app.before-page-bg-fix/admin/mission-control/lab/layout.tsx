import type { ReactNode } from "react";
import LabSidebar from "@/components/admin/mission-control/LabSidebar";

export default function MissionControlLabLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-7xl gap-6 p-8">
        <LabSidebar />

        <section className="flex-1">
          {children}
        </section>
      </div>
    </main>
  );
}
