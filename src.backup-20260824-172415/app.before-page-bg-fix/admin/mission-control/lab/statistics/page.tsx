import ProjectStatistics from "@/components/admin/mission-control/ProjectStatistics";

export const metadata = {
  title: "Project Statistics | Mission Control Lab",
  description: "View project statistics and health metrics.",
};

export default function StatisticsPage() {
  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">
          Project Statistics
        </h1>

        <p className="mt-2 text-gray-500">
          View project files, Firestore collections, governance health and system metrics.
        </p>
      </div>

      <ProjectStatistics />
    </div>
  );
}
