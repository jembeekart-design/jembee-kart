import AISystemAdvisor from "@/components/admin/mission-control/AISystemAdvisor";

export const metadata = {
  title: "AI Advisor | Mission Control Lab",
};

export default function Page() {
  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-bold">
        AI Advisor
      </h1>

      <AISystemAdvisor />
    </div>
  );
}
