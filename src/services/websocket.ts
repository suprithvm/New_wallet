import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:5000';

// Event types and listener interfaces
export type EventType = 'request:new' | 'request:updated' | 'transaction:pending' | 'wallet:balance_updated';

interface WebSocketListeners {
  [key: string]: Array<(data: any) => void>;
}

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: WebSocketListeners = {};
  private connectedAddresses: Set<string> = new Set();

  constructor() {
    this.initialize();
  }

  // Initialize the WebSocket connection
  private initialize(): void {
    this.socket = io(WS_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      
      // Reconnect all previously connected wallet addresses
      this.connectedAddresses.forEach(address => {
        this.connectWallet(address);
      });
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    // Set up event listeners for various event types
    this.setupEventListeners();
  }

  // Set up event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    const eventTypes: EventType[] = [
      'request:new',
      'request:updated',
      'transaction:pending',
      'wallet:balance_updated'
    ];

    eventTypes.forEach(eventType => {
      this.socket?.on(eventType, (data: any) => {
        if (this.listeners[eventType]) {
          this.listeners[eventType].forEach(callback => callback(data));
        }
      });
    });
  }

  // Connect a wallet address to receive updates
  public connectWallet(address: string): void {
    if (!this.socket) {
      this.initialize();
    }

    if (this.socket?.connected) {
      this.socket.emit('wallet:connect', address);
      this.connectedAddresses.add(address);
      console.log(`Wallet ${address} connected to WebSocket`);
    } else {
      this.connectedAddresses.add(address);
      console.log(`Wallet ${address} will be connected when socket is ready`);
    }
  }

  // Add event listener
  public addEventListener(eventType: EventType, callback: (data: any) => void): () => void {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    
    this.listeners[eventType].push(callback);
    
    // Return a function to remove this specific listener
    return () => {
      this.removeEventListener(eventType, callback);
    };
  }

  // Remove event listener
  public removeEventListener(eventType: EventType, callback: (data: any) => void): void {
    if (this.listeners[eventType]) {
      this.listeners[eventType] = this.listeners[eventType].filter(
        listener => listener !== callback
      );
    }
  }

  // Disconnect WebSocket
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectedAddresses.clear();
    }
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService; 