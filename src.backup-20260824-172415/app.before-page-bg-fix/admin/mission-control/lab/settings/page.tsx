export const metadata = {
  title: "Mission Lab Settings | Mission Control",
  description: "Configure Mission Control Lab settings.",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">
          Mission Lab Settings
        </h1>

        <p className="mt-2 text-gray-500">
          Configure scanners, Auto Fix, AI Advisor, reports and notifications.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          Settings
        </h2>

        <p className="mt-3 text-gray-600">
          This page will contain all Mission Control configuration options,
          including scanner settings, AI configuration, Auto Fix preferences,
          report generation and notification management.
        </p>
      </div>
    </div>
  );
}
