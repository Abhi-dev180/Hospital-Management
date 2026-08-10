import API_URL from './api';

// Create a singleton native WebSocket wrapper
class WebSocketClient {
  constructor() {
    this.url = API_URL.replace('http://', 'ws://').replace('https://', 'wss://');
    this.ws = null;
    this.listeners = new Map(); // Map<eventType, Set<callback>>
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.isConnected = false;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const { type, data } = JSON.parse(event.data);
          const callbacks = this.listeners.get(type);
          if (callbacks) {
            callbacks.forEach(cb => cb(data));
          }
        } catch (e) {
          console.error('[WebSocket] Error parsing message:', e);
        }
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        this.isConnected = false;
        this.ws = null;
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };
    } catch (e) {
      console.error('[WebSocket] Failed to construct WebSocket:', e);
      this.reconnect();
    }
  }

  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    
    console.log(`[WebSocket] Reconnecting in ${delay}ms (Attempt ${this.reconnectAttempts})`);
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    if (!this.isConnected) {
      this.connect();
    }
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: event, data }));
    } else {
      console.warn('[WebSocket] Cannot emit, not connected');
    }
  }
}

const socket = new WebSocketClient();
export default socket;
