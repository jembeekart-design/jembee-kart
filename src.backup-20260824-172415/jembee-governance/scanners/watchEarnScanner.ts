// src/jembee-governance/scanners/watchEarnScanner.ts

import fs from "fs";
import path from "path";

import {
  GovernanceViolation,
} from "../types/governance.types";

export interface WatchEarnScanResult {
  filesScanned: number;
  violations: GovernanceViolation[];
}

export class WatchEarnScanner {
  /**
   * Forbidden Watch & Earn Patterns
   */
  private readonly FORBIDDEN_PATTERNS = [
    "instantReward",
    "directCashReward",
    "autoWithdrawReward",
    "unlimitedReward",
    "rewardWithoutSales",
    "rewardWithoutUnlock",
  ];

  /**
   * Required Rules
   */
  private readonly REQUIRED_RULES = [
    "watchRewards",
    "watchTransactions",
    "lockedReward",
    "unlockReward",
  ];

  public scanProject(
    projectRoot: string
  ): WatchEarnScanResult {
    const violations: GovernanceViolation[] = [];

    const files =
      this.getSourceFiles(projectRoot);

    for (const filePath of files) {
      const fileViolations =
        this.scanFile(filePath);

      violations.push(...fileViolations);
    }

    return {
      filesScanned: files.length,
      violations,
    };
  }

  private scanFile(
    filePath: string
  ): GovernanceViolation[] {
    const violations: GovernanceViolation[] = [];

    try {
      const content = fs.readFileSync(
        filePath,
        "utf8"
      );

      /**
       * RULE 1
       * Forbidden Patterns
       */
      this.FORBIDDEN_PATTERNS.forEach(
        (pattern) => {
          if (
            content.includes(pattern)
          ) {
            violations.push({
              id: "WATCH_EARN_FORBIDDEN",

              title:
                "Forbidden Watch & Earn Logic Found",

              description:
                "Watch & Earn contains logic that violates JembeeKart policy.",

              category: "WATCH_EARN",

              severity: "CRITICAL",

              filePath,

              actualValue:
                pattern,

              recommendation:
                "Remove direct reward or unlimited reward logic.",

              detectedAt:
                new Date().toISOString(),
            });
          }
        }
      );

      /**
       * RULE 2
       * Watch Time Validation
       */
      const hasWatchValidation =
        content.includes(
          "watchDuration"
        ) ||
        content.includes(
          "watchTime"
        ) ||
        content.includes(
          "30"
        );

      if (
        content.includes("watch") &&
        !hasWatchValidation
      ) {
        violations.push({
          id: "WATCH_TIME_MISSING",

          title:
            "Watch Duration Validation Missing",

          description:
            "Valid watch duration (30 sec+) not detected.",

          category: "WATCH_EARN",

          severity: "WARNING",

          filePath,

          recommendation:
            "Require minimum watch duration before reward.",

          detectedAt:
            new Date().toISOString(),
        });
      }

      /**
       * RULE 3
       * Locked Reward Required
       */
      const hasLockedReward =
        content.includes(
          "lockedReward"
        ) ||
        content.includes(
          "rewardLocked"
        );

      if (
        content.includes("reward") &&
        !hasLockedReward
      ) {
        violations.push({
          id: "LOCKED_REWARD_MISSING",

          title:
            "Locked Reward System Missing",

          description:
            "Rewards appear to be issued without lock mechanism.",

          category: "WATCH_EARN",

          severity: "CRITICAL",

          filePath,

          recommendation:
            "All rewards must be locked first.",

          detectedAt:
            new Date().toISOString(),
        });
      }

      /**
       * RULE 4
       * Delivered Order Unlock
       */
      const hasDeliveredCheck =
        content.includes(
          "delivered"
        ) ||
        content.includes(
          "DELIVERED"
        ) ||
        content.includes(
          "orderDelivered"
        );

      if (
        content.includes(
          "unlockReward"
        ) &&
        !hasDeliveredCheck
      ) {
        violations.push({
          id: "UNLOCK_RULE_INVALID",

          title:
            "Reward Unlock Validation Missing",

          description:
            "Reward unlock found without delivered order validation.",

          category: "WATCH_EARN",

          severity: "CRITICAL",

          filePath,

          recommendation:
            "Unlock only after delivered orders.",

          detectedAt:
            new Date().toISOString(),
        });
      }

      /**
       * RULE 5
       * One Active Cycle
       */
      const hasCycleControl =
        content.includes(
          "activeCycle"
        ) ||
        content.includes(
          "currentCycle"
        ) ||
        content.includes(
          "cycleCompleted"
        );

      if (
        content.includes(
          "watchReward"
        ) &&
        !hasCycleControl
      ) {
        violations.push({
          id: "MULTI_CYCLE_RISK",

          title:
            "Reward Cycle Protection Missing",

          description:
            "Multiple reward cycles may be possible.",

          category: "WATCH_EARN",

          severity: "WARNING",

          filePath,

          recommendation:
            "Allow only one active reward cycle at a time.",

          detectedAt:
            new Date().toISOString(),
        });
      }

      /**
       * RULE 6
       * Admin Config Validation
       */
      const rewardConfigPresent =
        content.includes(
          "rewardConfig"
        ) ||
        content.includes(
          "adminConfig"
        ) ||
        content.includes(
          "settings"
        );

      const hardcodedReward =
        /rewardAmount\s*[:=]\s*\d+/gi.test(
          content
        );

      if (
        hardcodedReward &&
        !rewardConfigPresent
      ) {
        violations.push({
          id: "WATCH_REWARD_HARDCODED",

          title:
            "Hardcoded Reward Value Found",

          description:
            "Reward value should come from Admin Config.",

          category: "WATCH_EARN",

          severity: "CRITICAL",

          filePath,

          recommendation:
            "Move reward values to rewardConfig.",

          detectedAt:
            new Date().toISOString(),
        });
      }

      /**
       * RULE 7
       * Required Collections
       */
      this.REQUIRED_RULES.forEach(
        (rule) => {
          if (
            content.includes(
              "watch"
            ) &&
            !content.includes(rule)
          ) {
            violations.push({
              id: "WATCH_RULE_MISSING",

              title:
                "Required Watch & Earn Rule Missing",

              description:
                `${rule} not detected.`,

              category: "WATCH_EARN",

              severity: "WARNING",

              filePath,

              recommendation:
                `Implement ${rule}.`,

              detectedAt:
                new Date().toISOString(),
            });
          }
        }
      );
    } catch (error) {
      violations.push({
        id: "WATCH_SCAN_ERROR",

        title:
          "Watch Earn Scan Failed",

        description:
          error instanceof Error
            ? error.message
            : "Unknown Error",

        category: "WATCH_EARN",

        severity: "ERROR",

        filePath,

        detectedAt:
          new Date().toISOString(),
      });
    }

    return violations;
  }

  private getSourceFiles(
    rootDir: string
  ): string[] {
    const files: string[] = [];

    const walk = (dir: string) => {
      const entries =
        fs.readdirSync(dir);

      for (const entry of entries) {
        const fullPath =
          path.join(dir, entry);

        const stat =
          fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (
            [
              "node_modules",
              ".next",
              ".git",
              ".vercel",
              "dist",
              "build",
            ].includes(entry)
          ) {
            continue;
          }

          walk(fullPath);
        } else {
          if (
            fullPath.endsWith(".ts") ||
            fullPath.endsWith(".tsx")
          ) {
            files.push(fullPath);
          }
        }
      }
    };

    walk(rootDir);

    return files;
  }
}

export const watchEarnScanner =
  new WatchEarnScanner();
