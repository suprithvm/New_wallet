import React, { createContext, useContext, useState, useEffect } from 'react';
import { requestsApi } from '../services/api';
import { useWallet } from './WalletContext';
import { useSocket } from '../context/SocketContext';

// Define types
interface PaymentRequest {
  id: number;
  from_address: string;
  to_address: string;
  amount: number;
  note?: string;
  status: 'pending' | 'completed' | 'rejected' | 'expired';
  transaction_id?: string;
  created_at: string;
  expires_at: string;
  updated_at?: string;
}

interface RequestsContextType {
  incomingRequests: PaymentRequest[];
  outgoingRequests: PaymentRequest[];
  loading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>;
  createRequest: (to_address: string, amount: number, note?: string) => Promise<PaymentRequest>;
  updateRequestStatus: (id: number, status: 'completed' | 'rejected', transaction_id?: string) => Promise<PaymentRequest>;
  deleteRequest: (id: number) => Promise<boolean>;
}

// Create context
const RequestsContext = createContext<RequestsContextType | null>(null);

// Provider component
export const RequestsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { wallet } = useWallet();
  const { socket } = useSocket();
  const [incomingRequests, setIncomingRequests] = useState<PaymentRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to sort requests by created_at descending
  const sortByCreatedAtDesc = (arr: PaymentRequest[]) =>
    [...arr].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Listen for wallet and socket changes
  useEffect(() => {
    if (wallet?.address) {
      fetchRequests();
    }
  }, [wallet?.address]);

  // Listen for websocket events
  useEffect(() => {
    if (!socket || !wallet?.address) return;

    const handleNewRequest = (request: PaymentRequest) => {
      if (request.to_address === wallet.address) {
        setIncomingRequests(prev => sortByCreatedAtDesc([request, ...prev]));
      } else if (request.from_address === wallet.address) {
        setOutgoingRequests(prev => sortByCreatedAtDesc([request, ...prev]));
      }
    };

    const handleUpdatedRequest = (request: PaymentRequest) => {
      if (request.to_address === wallet.address) {
        setIncomingRequests(prev => sortByCreatedAtDesc(prev.map(req => req.id === request.id ? request : req)));
      } else if (request.from_address === wallet.address) {
        setOutgoingRequests(prev => sortByCreatedAtDesc(prev.map(req => req.id === request.id ? request : req)));
      }
    };

    socket.on('request:new', handleNewRequest);
    socket.on('request:updated', handleUpdatedRequest);

    return () => {
      socket.off('request:new', handleNewRequest);
      socket.off('request:updated', handleUpdatedRequest);
    };
  }, [socket, wallet?.address]);

  // Fetch all requests for the current wallet
  const fetchRequests = async (): Promise<void> => {
    try {
      if (!wallet?.address) return;
      
      setLoading(true);
      const data = await requestsApi.getRequests(wallet.address);
      
      if (data.incoming) {
        setIncomingRequests(sortByCreatedAtDesc(data.incoming));
      }
      
      if (data.outgoing) {
        setOutgoingRequests(sortByCreatedAtDesc(data.outgoing));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment requests');
      console.error('Error fetching payment requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new payment request
  const createRequest = async (to_address: string, amount: number, note?: string): Promise<PaymentRequest> => {
    try {
      if (!wallet?.address) {
        throw new Error('No wallet address');
      }
      
      setLoading(true);
      const newRequest = await requestsApi.createRequest(wallet.address, to_address, amount, note);
      setOutgoingRequests(prev => sortByCreatedAtDesc([newRequest, ...prev]));
      return newRequest;
    } catch (err: any) {
      setError(err.message || 'Failed to create payment request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update payment request status
  const updateRequestStatus = async (id: number, status: 'completed' | 'rejected', transaction_id?: string): Promise<PaymentRequest> => {
    try {
      setLoading(true);
      const updatedRequest = await requestsApi.updateRequestStatus(id.toString(), status, transaction_id);
      
      // Update in state
      setIncomingRequests(prev => 
        sortByCreatedAtDesc(prev.map(req => req.id === id ? updatedRequest : req))
      );
      
      setOutgoingRequests(prev => 
        sortByCreatedAtDesc(prev.map(req => req.id === id ? updatedRequest : req))
      );
      
      return updatedRequest;
    } catch (err: any) {
      setError(err.message || 'Failed to update payment request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a payment request
  const deleteRequest = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      await requestsApi.deleteRequest(id.toString());
      
      // Remove from state
      setIncomingRequests(prev => prev.filter(req => req.id !== id));
      setOutgoingRequests(prev => prev.filter(req => req.id !== id));
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete payment request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    incomingRequests,
    outgoingRequests,
    loading,
    error,
    fetchRequests,
    createRequest,
    updateRequestStatus,
    deleteRequest,
  };

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>;
};

// Custom hook for using the requests context
export const useRequests = () => {
  const context = useContext(RequestsContext);
  
  if (!context) {
    throw new Error('useRequests must be used within a RequestsProvider');
  }
  
  return context;
};

export default RequestsContext; 