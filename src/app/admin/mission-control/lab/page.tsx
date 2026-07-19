import EnterpriseScannerDashboard from "@/components/admin/mission-control/EnterpriseScannerDashboard";
import AutoFixCenter from "@/components/admin/mission-control/AutoFixCenter";
import AISystemAdvisor from "@/components/admin/mission-control/AISystemAdvisor";
import CodeQualityDashboard from "@/components/admin/mission-control/CodeQualityDashboard";
import ProjectStatistics from "@/components/admin/mission-control/ProjectStatistics";

export const metadata = {
  title: "Mission Control Lab | JembeeKart",
  description: "Experimental AI & Governance Dashboard",
};

export default function MissionControlLabPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl space-y-8 p-8">

        {/* Header */}
        <div className="rounded-2xl border bg-white p-8 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h1 className="text-4xl font-bold">
                🚀 Mission Control Lab
              </h1>

              <p className="mt-2 text-gray-500">
                Experimental Dashboard for AI, Governance,
                Enterprise Scanner and Auto Fix Engine.
              </p>

            </div>

            <div className="rounded-xl bg-green-100 px-4 py-2">

              <span className="font-semibold text-green-700">
                LAB MODE
              </span>

            </div>

          </div>

        </div>

        {/* Statistics */}
        <ProjectStatistics />

        {/* Enterprise Scanner */}
        <EnterpriseScannerDashboard />

        {/* Code Quality */}
        <CodeQualityDashboard />

        {/* Auto Fix */}
        <AutoFixCenter />

        {/* AI */}
        <AISystemAdvisor />

      </div>
    </main>
  );
}
