// src/shared/realtime/socket.ts

type Listener = (data: any) => void;

class SocketClient {
  private ws: WebSocket | null = null;
  private listeners: Record<string, Listener[]> = {};

  connect(url: string) {
    if (this.ws) return;

    this.ws = new WebSocket(url);

    this.ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        this.emit(msg.type, msg.payload);
      } catch {}
    };

    this.ws.onclose = () => {
      this.ws = null;
      // simple reconnect
      setTimeout(() => this.connect(url), 2000);
    };
  }

  send(type: string, payload: any) {
    if (!this.ws || this.ws.readyState !== 1) return;
    this.ws.send(JSON.stringify({ type, payload }));
  }

  on(type: string, cb: Listener) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(cb);
  }

  off(type: string, cb: Listener) {
    this.listeners[type] = (this.listeners[type] || []).filter(
      (l) => l !== cb
    );
  }

  private emit(type: string, payload: any) {
    (this.listeners[type] || []).forEach((cb) => cb(payload));
  }
}

export const socket = new SocketClient();