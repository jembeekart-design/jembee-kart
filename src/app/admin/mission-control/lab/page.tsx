import LabSidebar from "@/components/admin/mission-control/LabSidebar";
import EnterpriseScannerDashboard from "@/components/admin/mission-control/EnterpriseScannerDashboard";
import AutoFixCenter from "@/components/admin/mission-control/AutoFixCenter";
import AISystemAdvisor from "@/components/admin/mission-control/AISystemAdvisor";
import CodeQualityDashboard from "@/components/admin/mission-control/CodeQualityDashboard";
import ProjectStatistics from "@/components/admin/mission-control/ProjectStatistics";

export default function MissionControlLabPage() {
  return (
    <main className="min-h-screen bg-gray-50">

      <div className="mx-auto flex max-w-7xl gap-6 p-8">

        <LabSidebar />

        <div className="flex-1 space-y-8">

          <ProjectStatistics />

          <EnterpriseScannerDashboard />

          <CodeQualityDashboard />

          <AutoFixCenter />

          <AISystemAdvisor />

        </div>

      </div>

    </main>
  );
}
