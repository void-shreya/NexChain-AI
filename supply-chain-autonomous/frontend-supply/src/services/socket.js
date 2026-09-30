import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';

    if (!isLocalhost) {
      const configuredWs = import.meta.env.VITE_WS_URL;
      if (configuredWs && !configuredWs.includes('localhost') && !configuredWs.includes('127.0.0.1')) {
        return configuredWs;
      }
      return 'https://nexchain-ai.onrender.com';
    }
  }
  return import.meta.env.VITE_WS_URL || 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

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
        closeOnBeforeunload: true,
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

if (typeof window !== 'undefined') {
  // Cleanly close socket when browser navigates away or caches page in bfcache
  window.addEventListener('pagehide', () => {
    socketService.disconnect();
  });

  // Re-establish socket when page is restored from bfcache
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      socketService.connect();
    }
  });
}
