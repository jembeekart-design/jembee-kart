import ProjectStatistics from "@/components/admin/mission-control/ProjectStatistics";
import EnterpriseScannerDashboard from "@/components/admin/mission-control/EnterpriseScannerDashboard";
import CodeQualityDashboard from "@/components/admin/mission-control/CodeQualityDashboard";
import AutoFixCenter from "@/components/admin/mission-control/AutoFixCenter";
import AISystemAdvisor from "@/components/admin/mission-control/AISystemAdvisor";

export const metadata = {
  title: "Mission Control Lab",
};

export default function MissionControlLabPage() {
  return (
    <div className="space-y-8">
      <ProjectStatistics />
      <EnterpriseScannerDashboard />
      <CodeQualityDashboard />
      <AutoFixCenter />
      <AISystemAdvisor />
    </div>
  );
}
