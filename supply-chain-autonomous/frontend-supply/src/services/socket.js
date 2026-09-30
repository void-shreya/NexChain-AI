import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket) return this.socket;

    try {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      this.socket.on('connect', () => {
        console.log('⚡ Realtime WebSocket connected to Control Tower');
      });

      this.socket.on('connect_error', (err) => {
        console.warn('⚠️ Realtime WebSocket connection issue (will retry):', err.message);
      });
    } catch (e) {
      console.warn('Socket initialize error:', e);
    }

    return this.socket;
  }

  on(event, callback) {
    if (!this.socket) this.connect();
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
