import React, { createContext, useContext, useState, useEffect } from 'react';
import { requestsApi } from '../services/api';
import websocketService from '../services/websocket';
import { useWallet } from './WalletContext';

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
  const [incomingRequests, setIncomingRequests] = useState<PaymentRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and listen for wallet changes
  useEffect(() => {
    if (wallet?.address) {
      fetchRequests();
      
      // Listen for new payment requests
      const newRequestListener = websocketService.addEventListener('request:new', handleNewRequest);
      
      // Listen for updated payment requests
      const updateRequestListener = websocketService.addEventListener('request:updated', handleUpdatedRequest);
      
      return () => {
        newRequestListener();
        updateRequestListener();
      };
    }
  }, [wallet?.address]);

  // Handle new payment request via WebSocket
  const handleNewRequest = (request: PaymentRequest) => {
    if (!wallet?.address) return;
    
    if (request.to_address === wallet.address) {
      setIncomingRequests(prev => [request, ...prev]);
    } else if (request.from_address === wallet.address) {
      setOutgoingRequests(prev => [request, ...prev]);
    }
  };

  // Handle updated payment request via WebSocket
  const handleUpdatedRequest = (request: PaymentRequest) => {
    if (!wallet?.address) return;
    
    if (request.to_address === wallet.address) {
      setIncomingRequests(prev => 
        prev.map(req => req.id === request.id ? request : req)
      );
    } else if (request.from_address === wallet.address) {
      setOutgoingRequests(prev => 
        prev.map(req => req.id === request.id ? request : req)
      );
    }
  };

  // Fetch all requests for the current wallet
  const fetchRequests = async (): Promise<void> => {
    try {
      if (!wallet?.address) return;
      
      setLoading(true);
      const data = await requestsApi.getRequests(wallet.address);
      
      if (data.incoming) {
        setIncomingRequests(data.incoming);
      }
      
      if (data.outgoing) {
        setOutgoingRequests(data.outgoing);
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
      setOutgoingRequests(prev => [newRequest, ...prev]);
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
        prev.map(req => req.id === id ? updatedRequest : req)
      );
      
      setOutgoingRequests(prev => 
        prev.map(req => req.id === id ? updatedRequest : req)
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