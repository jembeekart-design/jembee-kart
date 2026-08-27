import CodeQualityDashboard from "@/components/admin/mission-control/CodeQualityDashboard";

export const metadata = {
  title: "Code Quality | Mission Control Lab",
  description: "Analyze project quality, warnings and scanner results.",
};

export default function QualityPage() {
  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">
          Code Quality
        </h1>

        <p className="mt-2 text-gray-500">
          Analyze code quality, warnings, errors and governance compliance.
        </p>
      </div>

      <CodeQualityDashboard />
    </div>
  );
}
