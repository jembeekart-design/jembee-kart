import AutoFixCenter from "@/components/admin/mission-control/AutoFixCenter";

export const metadata = {
  title: "Auto Fix Center | Mission Control Lab",
};

export default function Page() {
  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">
        Auto Fix Center
      </h1>

      <AutoFixCenter />
    </div>
  );
}
