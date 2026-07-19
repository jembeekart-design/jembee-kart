import EnterpriseScannerDashboard from "@/components/admin/mission-control/EnterpriseScannerDashboard";
import AutoFixCenter from "@/components/admin/mission-control/AutoFixCenter";
import AISystemAdvisor from "@/components/admin/mission-control/AISystemAdvisor";
import CodeQualityDashboard from "@/components/admin/mission-control/CodeQualityDashboard";
import ProjectStatistics from "@/components/admin/mission-control/ProjectStatistics";

export const metadata = {
  title: "Mission Control Lab | JembeeKart",
};

export default function MissionControlLabPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <h1 className="text-3xl font-bold">
        🚀 Mission Control Lab
      </h1>

      <p className="text-gray-500">
        Experimental dashboard for new scanners, AI features and Auto Fix tools.
      </p>

      <ProjectStatistics />

      <EnterpriseScannerDashboard />

      <CodeQualityDashboard />

      <AutoFixCenter />

      <AISystemAdvisor />
    </div>
  );
}
