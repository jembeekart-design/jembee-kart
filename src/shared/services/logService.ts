// src/shared/services/logService.ts

type LogLevel = "info" | "warn" | "error";

type LogEntry = {
  level: LogLevel;
  message: string;
  meta?: Record<string, any>;
  ts: number;
};

let logs: LogEntry[] = [];

// 🔹 Core logger
const write = (entry: LogEntry) => {
  logs.push(entry);

  // console mirror (dev)
  if (typeof window !== "undefined") {
    const fn =
      entry.level === "error"
        ? console.error
        : entry.level === "warn"
        ? console.warn
        : console.log;

    fn(`[${entry.level.toUpperCase()}]`, entry.message, entry.meta || {});
  }
};

export const logInfo = (message: string, meta?: any) =>
  write({ level: "info", message, meta, ts: Date.now() });

export const logWarn = (message: string, meta?: any) =>
  write({ level: "warn", message, meta, ts: Date.now() });

export const logError = (message: string, meta?: any) =>
  write({ level: "error", message, meta, ts: Date.now() });

// 🔹 Admin read
export const getLogs = () => logs;

// 🔹 Clear (admin)
export const clearLogs = () => {
  logs = [];
};