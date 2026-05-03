"use client";

import { useEffect, useRef, useState } from "react";

// 🔥 TYPE (event system ready)
type RealtimeEvent = {
  type: string;
  payload?: any;
};

// 🔥 SIMPLE EVENT BUS (future socket replaceable)
class RealtimeEngine {
  private listeners: ((event: RealtimeEvent) => void)[] = [];

  subscribe(cb: (event: RealtimeEvent) => void) {
    this.listeners.push(cb);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  emit(event: RealtimeEvent) {
    this.listeners.forEach((cb) => cb(event));
  }
}

// 🌐 SINGLETON (important)
const realtime = new RealtimeEngine();

export const useRealtime = () => {
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    // 🔌 Simulate connection (later Firebase/WebSocket)
    setConnected(true);
    console.log("⚡ Realtime Connected");

    // 🧹 Cleanup
    return () => {
      listenersRef.current.forEach((unsub) => unsub());
      listenersRef.current = [];
      setConnected(false);
      console.log("❌ Realtime Disconnected");
    };
  }, []);

  // 📡 Listen event
  const on = (callback: (event: RealtimeEvent) => void) => {
    const unsubscribe = realtime.subscribe(callback);
    listenersRef.current.push(unsubscribe);
  };

  // 🚀 Emit event
  const emit = (event: RealtimeEvent) => {
    realtime.emit(event);
  };

  return {
    connected,
    on,
    emit,
  };
};
