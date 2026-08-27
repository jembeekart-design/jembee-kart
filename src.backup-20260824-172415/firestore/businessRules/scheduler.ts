import { businessRules } from "./service";
import { businessRulesCache } from "./cache";
import { businessRulesMetrics } from "./metrics";

// ======================================================
// Business Rules Scheduler
// Production Ready
// ======================================================

export interface SchedulerStatus {
  running: boolean;
  intervalMs: number;
  lastRun: string | null;
  nextRun: string | null;
  refreshCount: number;
  errorCount: number;
}

class BusinessRulesScheduler {

  private timer: NodeJS.Timeout | null = null;

  private readonly DEFAULT_INTERVAL =
    5 * 60 * 1000; // 5 Minutes

  private status: SchedulerStatus = {
    running: false,
    intervalMs: this.DEFAULT_INTERVAL,
    lastRun: null,
    nextRun: null,
    refreshCount: 0,
    errorCount: 0,
  };

  // ====================================================
  // Start Scheduler
  // ====================================================

  start(
    intervalMs = this.DEFAULT_INTERVAL
  ): void {

    if (this.timer) {
      return;
    }

    this.status.running = true;
    this.status.intervalMs = intervalMs;

    this.scheduleNextRun();

    this.timer = setInterval(
      async () => {
        await this.refresh();
      },
      intervalMs
    );

    console.info(
      "[BusinessRules] Scheduler Started"
    );

  }

  // ====================================================
  // Stop Scheduler
  // ====================================================

  stop(): void {

    if (!this.timer) {
      return;
    }

    clearInterval(this.timer);

    this.timer = null;

    this.status.running = false;

    this.status.nextRun = null;

    console.info(
      "[BusinessRules] Scheduler Stopped"
    );

  }

  // ====================================================
  // Refresh
  // ====================================================

  async refresh(): Promise<void> {

    try {

      businessRulesCache.clear();

      await businessRules.getAllRules();

      businessRulesMetrics.incrementRefresh();

      this.status.refreshCount++;

      this.status.lastRun =
        new Date().toISOString();

      this.scheduleNextRun();

      console.info(
        "[BusinessRules] Refresh Complete"
      );

    } catch (error) {

      this.status.errorCount++;

      console.error(
        "[BusinessRules] Refresh Failed",
        error
      );

    }

  }

  // ====================================================
  // Schedule Next Run
  // ====================================================

  private scheduleNextRun(): void {

    this.status.nextRun =
      new Date(
        Date.now() +
          this.status.intervalMs
      ).toISOString();

  }

  // ====================================================
  // Restart
  // ====================================================

  restart(
    intervalMs = this.status.intervalMs
  ): void {

    this.stop();

    this.start(intervalMs);

  }

  // ====================================================
  // Status
  // ====================================================

  getStatus(): SchedulerStatus {

    return {
      ...this.status,
    };

  }

  // ====================================================
  // Running?
  // ====================================================

  isRunning(): boolean {

    return this.status.running;

  }

}

export const businessRulesScheduler =
  new BusinessRulesScheduler();
