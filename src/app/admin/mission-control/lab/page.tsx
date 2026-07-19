import MissionControlSummary from "@/components/admin/mission-control/MissionControlSummary";
import RecentScanResults from "@/components/admin/mission-control/RecentScanResults";
import ProjectStatistics from "@/components/admin/mission-control/ProjectStatistics";
import EnterpriseScannerDashboard from "@/components/admin/mission-control/EnterpriseScannerDashboard";
import CodeQualityDashboard from "@/components/admin/mission-control/CodeQualityDashboard";
import AutoFixCenter from "@/components/admin/mission-control/AutoFixCenter";
import AISystemAdvisor from "@/components/admin/mission-control/AISystemAdvisor";
import LiveActivityLog from "@/components/admin/mission-control/LiveActivityLog";
import SystemHealthMonitor from "@/components/admin/mission-control/SystemHealthMonitor";
import BuildDeploymentStatus from "@/components/admin/mission-control/BuildDeploymentStatus";
import ScannerControlPanel from "@/components/admin/mission-control/ScannerControlPanel";
import GovernanceCenter from "@/components/admin/mission-control/GovernanceCenter";

export const metadata = {
  title: "Mission Control Lab",
  description: "Enterprise Mission Control Dashboard for JembeeKart",
};

export default function MissionControlLabPage() {
  return (
    <div className="space-y-8">
      {/* Live Summary */}
      <MissionControlSummary />

      {/* Recent Scan Results */}
      <RecentScanResults />

      <LiveActivityLog />

      <SystemHealthMonitor />
      
      <BuildDeploymentStatus />
      
      <ScannerControlPanel />
      
      <GovernanceCenter />
      
      {/* Project Statistics */}
      <ProjectStatistics />

      {/* Enterprise Scanner */}
      <EnterpriseScannerDashboard />

      {/* Code Quality */}
      <CodeQualityDashboard />

      {/* Auto Fix Center */}
      <AutoFixCenter />

      {/* AI Advisor */}
      <AISystemAdvisor />
    </div>
  );
}
