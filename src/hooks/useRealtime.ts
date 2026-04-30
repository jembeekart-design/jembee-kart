"use client";

import { useEffect } from "react";
import { socket } from "@/shared/realtime/socket";

export const useRealtime = (url: string) => {
  useEffect(() => {
    socket.connect(url);
  }, [url]);

  return {
    send: socket.send,
    on: socket.on,
    off: socket.off,
  };
};