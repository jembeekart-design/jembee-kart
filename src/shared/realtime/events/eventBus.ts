// src/shared/realtime/events/eventBus.ts

type Handler = (payload: any) => void;

class EventBus {
  private handlers: Record<string, Handler[]> = {};

  emit(event: string, payload: any) {
    (this.handlers[event] || []).forEach((h) => h(payload));
  }

  on(event: string, handler: Handler) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(handler);
  }

  off(event: string, handler: Handler) {
    this.handlers[event] = (this.handlers[event] || []).filter(
      (h) => h !== handler
    );
  }
}

export const eventBus = new EventBus();