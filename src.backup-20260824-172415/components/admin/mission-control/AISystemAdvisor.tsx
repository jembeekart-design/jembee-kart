"use client";

import {
  Brain,
  Lightbulb,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";

const suggestions = [
  {
    title: "Architecture Review",
    description:
      "Review project structure and folder organization.",
    icon: Brain,
  },
  {
    title: "Performance Tips",
    description:
      "Find slow components and optimization opportunities.",
    icon: Zap,
  },
  {
    title: "Security Review",
    description:
      "Check authentication, Firestore usage and security.",
    icon: ShieldCheck,
  },
  {
    title: "AI Recommendations",
    description:
      "Receive intelligent suggestions to improve the project.",
    icon: Lightbulb,
  },
];

export default function AISystemAdvisor() {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">

      <div className="flex items-center gap-3 mb-6">

        <div className="rounded-lg bg-violet-100 p-3">
          <Brain
            size={24}
            className="text-violet-600"
          />
        </div>

        <div>
          <h2 className="text-xl font-bold">
            AI System Advisor
          </h2>

          <p className="text-sm text-gray-500">
            AI-powered recommendations for your project.
          </p>
        </div>

      </div>

      <div className="grid gap-4 md:grid-cols-2">

        {suggestions.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-lg border p-5 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="rounded-lg bg-gray-100 p-3">
                    <Icon size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {item.title}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {item.description}
                    </p>
                  </div>

                </div>

                <ArrowRight
                  size={18}
                  className="text-gray-400"
                />

              </div>
            </div>
          );
        })}

      </div>

      <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 p-4">

        <p className="font-semibold text-blue-700">
          AI Status
        </p>

        <p className="text-sm text-blue-600 mt-1">
          AI analysis is not connected yet. Once connected,
          recommendations from Mission Control will appear here.
        </p>

      </div>

    </section>
  );
}
