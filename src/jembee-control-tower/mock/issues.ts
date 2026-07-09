import type { ControlTowerIssue } from "../scanners";

export const mockIssues: ControlTowerIssue[] = [
  {
    id: "THEME-001",
    category: "THEME",
    severity: "WARNING",
    title: "Hardcoded Tailwind Color",
    file: "src/components/ProductCard.tsx",
    line: 48,
    message: "Direct Tailwind color detected.",
    fix: "Replace bg-[var(--primary-color)] with theme.primaryColor",
  },
  {
    id: "SECURITY-001",
    category: "SECURITY",
    severity: "CRITICAL",
    title: "Authentication Missing",
    file: "src/app/admin/orders/page.tsx",
    line: 12,
    message: "Authentication guard missing.",
    fix: "Wrap page with DashboardGuard",
  },
  {
    id: "WATCH-001",
    category: "WATCH_EARN",
    severity: "CRITICAL",
    title: "Locked Reward Missing",
    file: "src/lib/mlm/watch-earn/createWatchReward.ts",
    line: 35,
    message: "Reward unlock flow missing.",
    fix: "Implement lockedReward architecture",
  },
];
