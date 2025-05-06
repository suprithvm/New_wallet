import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { walletApi, requestsApi } from '../services/api';

// Define wallet types
export interface Wallet {
  address: string;
  balance: number;
  mnemonic?: string;
  privateKey?: string;
  publicKey?: string;
  nonce?: number;
}

export interface Transaction {
  txid: string;
  sender: string;
  receiver: string;
  amount: number;
  timestamp: number;
  status: string;
  blockHeight?: number;
  blockHash?: string;
  type?: string;
}

export interface Contact {
  id: string;
  name: string;
  address: string;
}

export interface PaymentRequest {
  id: string;
  from: string;
  to: string;
  amount: number;
  note?: string;
  status: 'pending' | 'completed' | 'rejected';
  timestamp: number;
}

interface WalletContextType {
  wallet: Wallet | null;
  loading: boolean;
  error: string | null;
  transactions: Transaction[];
  contacts: Contact[];
  paymentRequests: PaymentRequest[];
  initialized: boolean;
  
  // Wallet functions
  createWallet: (password: string) => Promise<Wallet>;
  importWallet: (mnemonic: string, password: string) => Promise<Wallet>;
  lockWallet: () => void;
  unlockWallet: (password: string) => Promise<boolean>;
  getBalance: () => Promise<number>;
  
  // Transaction functions
  sendTransaction: (to: string, amount: number) => Promise<Transaction>;
  getTransactionHistory: () => Promise<Transaction[]>;
  
  // Contact functions
  addContact: (name: string, address: string) => void;
  removeContact: (id: string) => void;
  
  // Payment request functions
  createPaymentRequest: (to: string, amount: number, note?: string) => Promise<PaymentRequest>;
  respondToPaymentRequest: (requestId: string, accept: boolean) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  
  // Initialize wallet from local storage
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        
        // Check if wallet exists in local storage
        const storedWallet = localStorage.getItem('wallet');
        if (storedWallet) {
          // Here we just have the encrypted wallet info, not the actual wallet
          // We'll need to unlock it with the password first
          setInitialized(true);
        } else {
          setInitialized(true);
        }
        
        // Load contacts from local storage
        const storedContacts = localStorage.getItem('contacts');
        if (storedContacts) {
          setContacts(JSON.parse(storedContacts));
        }
        
        // Load payment requests
        // In a real app, these would come from your backend server
        // For demo purposes, we'll just initialize an empty array
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    initialize();
  }, []);
  
  // When wallet changes, save encrypted version to local storage
  useEffect(() => {
    if (wallet) {
      // For security, we don't store the mnemonic in localStorage
      // We only store the encrypted wallet info (address, publicKey)
      const walletInfo = {
        address: wallet.address,
        publicKey: wallet.publicKey
      };
      localStorage.setItem('wallet', JSON.stringify(walletInfo));
      
      // Fetch transactions when wallet is set or changed
      getTransactionHistory();
    }
  }, [wallet?.address]);
  
  // Save contacts to local storage when they change
  useEffect(() => {
    if (contacts.length > 0) {
      localStorage.setItem('contacts', JSON.stringify(contacts));
    }
  }, [contacts]);
  
  const createWallet = async (password: string): Promise<Wallet> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await walletApi.createWallet();
      
      // In a real app, you'd encrypt the mnemonic with the password
      // For demo, we'll just store it as is (this is NOT secure for production)
      const newWallet: Wallet = {
        address: response.address,
        mnemonic: response.mnemonic,
        privateKey: response.privateKey,
        publicKey: response.publicKey,
        balance: 0
      };
      
      setWallet(newWallet);
      return newWallet;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const importWallet = async (mnemonic: string, password: string): Promise<Wallet> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await walletApi.importWallet(mnemonic);
      
      // In a real app, you'd encrypt the mnemonic with the password
      const newWallet: Wallet = {
        address: response.address,
        mnemonic: response.mnemonic,
        privateKey: response.privateKey,
        publicKey: response.publicKey,
        balance: 0
      };
      
      setWallet(newWallet);
      
      // Get initial balance
      if (newWallet.address) {
        getBalance();
      }
      
      return newWallet;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const lockWallet = () => {
    // In a real app, we'd just remove the decrypted wallet from memory
    // but keep the encrypted version in localStorage
    setWallet(null);
  };
  
  const unlockWallet = async (password: string): Promise<boolean> => {
    // In a real app, we'd decrypt the wallet using the password
    // For demo, we'll just simulate a successful unlock
    
    // Get the stored wallet info
    const storedWallet = localStorage.getItem('wallet');
    if (!storedWallet) {
      return false;
    }
    
    // This would actually decrypt and verify the wallet
    // For demo, we'll just pretend it worked
    try {
      const walletInfo = JSON.parse(storedWallet);
      
      // In a real app, we'd use the password to decrypt and get the mnemonic
      // For demo, just set what we have
      setWallet({
        address: walletInfo.address,
        publicKey: walletInfo.publicKey,
        balance: 0
      });
      
      // Get the latest balance
      if (walletInfo.address) {
        getBalance();
      }
      
      return true;
    } catch (err) {
      return false;
    }
  };
  
  const getBalance = async (): Promise<number> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!wallet) {
        throw new Error('Wallet not initialized');
      }
      
      const response = await walletApi.getBalance(wallet.address);
      setWallet(prev => prev ? { ...prev, balance: response.balance } : null);
      return response.balance;
    } catch (err: any) {
      setError(err.message);
      return 0;
    } finally {
      setLoading(false);
    }
  };
  
  const sendTransaction = async (to: string, amount: number): Promise<Transaction> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!wallet) {
        throw new Error('Wallet not initialized');
      }
      
      // Send transaction directly (simplified for this demo)
      const response = await walletApi.sendTransaction(
        wallet.address,
        to,
        amount,
        wallet.privateKey // In a real app, you'd handle signatures more securely
      );
      
      // Create a transaction object from the response
      const newTransaction: Transaction = {
        txid: response.txid,
        sender: wallet.address,
        receiver: to,
        amount: amount,
        timestamp: Date.now(),
        status: 'pending',
        type: 'send'
      };
      
      // Add to local transaction history
      setTransactions(prev => [newTransaction, ...prev]);
      
      return newTransaction;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const getTransactionHistory = async (): Promise<Transaction[]> => {
    if (!wallet?.address) return [];
    
    try {
      setLoading(true);
      const response = await walletApi.getTransactions(wallet.address);
      
      const formattedTransactions = response.map((tx: any) => ({
        txid: tx.hash,
        sender: tx.from,
        receiver: tx.to,
        amount: tx.value,
        timestamp: tx.timestamp,
        status: tx.confirmed ? 'confirmed' : 'pending',
        blockHeight: tx.blockHeight,
        blockHash: tx.blockHash
      }));
      
      setTransactions(formattedTransactions);
      return formattedTransactions;
    } catch (err: any) {
      console.error('Failed to fetch transaction history:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const addContact = (name: string, address: string) => {
    const newContact: Contact = {
      id: Date.now().toString(),
      name,
      address
    };
    
    setContacts(prev => [...prev, newContact]);
  };
  
  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
  };
  
  const createPaymentRequest = async (to: string, amount: number, note?: string): Promise<PaymentRequest> => {
    if (!wallet?.address) {
      throw new Error('No wallet available');
    }
    
    // In a real app, this request would be sent to your backend server
    // For demo, we'll just create it locally
    const newRequest: PaymentRequest = {
      id: Date.now().toString(),
      from: wallet.address,
      to,
      amount,
      note,
      status: 'pending',
      timestamp: Date.now()
    };
    
    setPaymentRequests(prev => [...prev, newRequest]);
    
    return newRequest;
  };
  
  const respondToPaymentRequest = async (requestId: string, accept: boolean): Promise<void> => {
    // Find the request
    const request = paymentRequests.find(r => r.id === requestId);
    if (!request) {
      throw new Error('Payment request not found');
    }
    
    if (accept) {
      // Send the transaction
      await sendTransaction(request.from, request.amount);
      
      // Update request status
      setPaymentRequests(prev => 
        prev.map(r => 
          r.id === requestId ? { ...r, status: 'completed' } : r
        )
      );
    } else {
      // Just mark as rejected
      setPaymentRequests(prev => 
        prev.map(r => 
          r.id === requestId ? { ...r, status: 'rejected' } : r
        )
      );
    }
  };
  
  const value: WalletContextType = {
    wallet,
    loading,
    error,
    transactions,
    contacts,
    paymentRequests,
    initialized,
    
    createWallet,
    importWallet,
    lockWallet,
    unlockWallet,
    getBalance,
    
    sendTransaction,
    getTransactionHistory,
    
    addContact,
    removeContact,
    
    createPaymentRequest,
    respondToPaymentRequest
  };
  
  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContext; 