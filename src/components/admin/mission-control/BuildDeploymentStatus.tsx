"use client";

import {
  Rocket,
  GitBranch,
  CheckCircle2,
  Server,
  Clock,
  Globe,
} from "lucide-react";

const deployments = [
  {
    title: "Production",
    value: "Healthy",
    icon: Rocket,
    status: "Live",
  },
  {
    title: "Latest Build",
    value: "Successful",
    icon: CheckCircle2,
    status: "Passed",
  },
  {
    title: "Git Branch",
    value: "main",
    icon: GitBranch,
    status: "Synced",
  },
  {
    title: "Hosting",
    value: "Vercel",
    icon: Globe,
    status: "Running",
  },
  {
    title: "Server",
    value: "Online",
    icon: Server,
    status: "Healthy",
  },
  {
    title: "Last Deploy",
    value: "5 min ago",
    icon: Clock,
    status: "Recent",
  },
];

export default function BuildDeploymentStatus() {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Build & Deployment Status
        </h2>

        <p className="text-sm text-gray-500">
          Current deployment and build information.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {deployments.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-xl border p-5"
            >
              <Icon className="mb-3 h-7 w-7 text-indigo-600" />

              <h3 className="text-sm text-gray-500">
                {item.title}
              </h3>

              <p className="mt-2 text-2xl font-bold">
                {item.value}
              </p>

              <span className="mt-2 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                {item.status}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
