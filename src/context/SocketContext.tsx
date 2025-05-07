import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useWallet } from '../contexts/WalletContext';

// Environment-based configuration
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
const SOCKET_OPTIONS = {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
};

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ 
  socket: null,
  isConnected: false 
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { wallet } = useWallet();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);

  useEffect(() => {
    // Only connect if not already connected
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, SOCKET_OPTIONS);
    }
    const socket = socketRef.current;

    // Connection status handlers
    const handleConnect = () => {
      setIsConnected(true);
      if (wallet?.address) {
        socket.emit('wallet:connect', wallet.address);
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleError = (error: Error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    };

    // Event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('error', handleError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('error', handleError);
    };
  }, [wallet?.address]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext); 