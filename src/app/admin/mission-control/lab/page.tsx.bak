import MissionControlErrorBoundary from "@/components/admin/mission-control/MissionControlErrorBoundary";

import MissionControlSummary from "@/components/admin/mission-control/MissionControlSummary";
import RecentScanResults from "@/components/admin/mission-control/RecentScanResults";
import LiveActivityLog from "@/components/admin/mission-control/LiveActivityLog";
import SystemHealthMonitor from "@/components/admin/mission-control/SystemHealthMonitor";
import BuildDeploymentStatus from "@/components/admin/mission-control/BuildDeploymentStatus";
import ScannerControlPanel from "@/components/admin/mission-control/ScannerControlPanel";
import GovernanceCenter from "@/components/admin/mission-control/GovernanceCenter";
import AutomationCenter from "@/components/admin/mission-control/AutomationCenter";
import ReportsCenter from "@/components/admin/mission-control/ReportsCenter";

import ProjectStatistics from "@/components/admin/mission-control/ProjectStatistics";
import EnterpriseScannerDashboard from "@/components/admin/mission-control/EnterpriseScannerDashboard";
import CodeQualityDashboard from "@/components/admin/mission-control/CodeQualityDashboard";
import AutoFixCenter from "@/components/admin/mission-control/AutoFixCenter";
import AISystemAdvisor from "@/components/admin/mission-control/AISystemAdvisor";
import SuggestionReport from "./components/SuggestionReport";
import BackupCard from "./components/BackupCard";
import RollbackCard from "./components/RollbackCard";
import AutoFixCard from "./components/AutoFixCard";

export const metadata = {
  title: "Mission Control Lab",
  description: "Enterprise Mission Control Dashboard for JembeeKart",
};

export default function MissionControlLabPage() {
  return (
    <MissionControlErrorBoundary>
      <main className="space-y-8">
        {/* Live Summary */}
        <MissionControlSummary />

        {/* Recent Scan Results */}
        <RecentScanResults />

        {/* Live Activity */}
        <LiveActivityLog />

        {/* System Health */}
        <SystemHealthMonitor />

        {/* Build Status */}
        <BuildDeploymentStatus />

        {/* Scanner Controls */}
        <ScannerControlPanel />

        {/* Governance */}
        <GovernanceCenter />

        {/* Automation */}
        <AutomationCenter />

        {/* Reports */}
        <ReportsCenter />

        {/* Statistics */}
        <ProjectStatistics />

        {/* Enterprise Scanner */}
        <EnterpriseScannerDashboard />

        {/* Code Quality */}
        <CodeQualityDashboard />

        {/* Auto Fix */}
        <AutoFixCenter />

        {/* AI Advisor */}
        <AISystemAdvisor />
        <section className="space-y-6">
    <SuggestionReport />

    <div className="grid gap-6 md:grid-cols-2">
      <BackupCard />
      <RollbackCard />
    </div>

    <AutoFixCard />
  </section>
</main>
    </MissionControlErrorBoundary>
  );
}
