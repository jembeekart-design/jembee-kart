import EnterpriseScannerDashboard from "@/components/admin/mission-control/EnterpriseScannerDashboard";

export const metadata = {
  title: "Enterprise Scanner",
};

export default function ScannerPage() {
  return (
    <div className="space-y-6 p-8">

      <div>
        <h1 className="text-3xl font-bold">
          Enterprise Scanner
        </h1>

        <p className="text-gray-500">
          Scan the entire project.
        </p>
      </div>

      <EnterpriseScannerDashboard />

    </div>
  );
}
