// src/shared/services/eventTracker.ts

type EventPayload = {
  name: string;
  props?: Record<string, any>;
  userId?: string;
  ts?: number;
};

let events: EventPayload[] = [];

// 🔹 Track event
export const trackEvent = (event: EventPayload) => {
  const enriched = {
    ...event,
    ts: Date.now(),
  };

  events.push(enriched);

  // debug log
  if (typeof window !== "undefined") {
    console.debug("[EVENT]", enriched.name, enriched.props);
  }
};

// 🔹 Get events (admin)
export const getEvents = () => events;

// 🔹 Clear events
export const clearEvents = () => {
  events = [];
};