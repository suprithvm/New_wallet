import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { walletApi } from '../services/api';
import websocketService from '../services/websocket';

// Define types
interface Wallet {
  address: string;
  balance: number;
  transactions: any[];
  mnemonic: string;
  privateKey: string;
  publicKey: string;
}

interface WalletContextType {
  wallet: Wallet | null;
  loading: boolean;
  error: string | null;
  createWallet: (password: string) => Promise<Wallet>;
  importWallet: (mnemonic: string) => Promise<Wallet>;
  fetchBalance: (address?: string, force?: boolean) => Promise<number>;
  fetchTransactions: (address?: string, limit?: number, offset?: number, force?: boolean) => Promise<any[]>;
  estimateFee: (to: string, amount: number) => Promise<any>;
  createUnsignedTransaction: (to: string, amount: number, gasPrice?: number, gasLimit?: number) => Promise<any>;
  signTransaction: (unsignedTx: any) => Promise<any>;
  sendSignedTransaction: (signedTx: any) => Promise<any>;
  sendTransactionWithKey: (to: string, amount: number, gasPrice: number, gasLimit: number) => Promise<any>;
  pollTransactionStatus: (txId: string, callback: (status: string, tx: any) => void) => Promise<void>;
  disconnectWallet: () => void;
}

// Create context
const WalletContext = createContext<WalletContextType | null>(null);

// LocalStorage keys
const WALLET_STORAGE_KEY = 'wallet_address';

// Provider component
export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cache timestamps for throttling requests
  const lastBalanceFetch = useRef<Record<string, number>>({});
  const lastTransactionsFetch = useRef<Record<string, number>>({});
  const THROTTLE_TIME = 5000; // 5 seconds between requests

  // Initialize wallet from localStorage if exists
  useEffect(() => {
    const initialize = async () => {
      try {
        const savedAddress = localStorage.getItem(WALLET_STORAGE_KEY);
        
        if (savedAddress) {
          await loadWalletData(savedAddress);
        }
      } catch (err) {
        setError('Failed to initialize wallet');
        console.error('Wallet initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Connect to WebSocket when wallet is loaded
  useEffect(() => {
    if (wallet?.address) {
      websocketService.connectWallet(wallet.address);
      
      // Listen for balance updates
      const cleanupBalanceListener = websocketService.addEventListener(
        'wallet:balance_updated', 
        (data) => {
          if (data.address === wallet.address) {
            setWallet(prev => prev ? { ...prev, balance: data.balance } : null);
          }
        }
      );
      
      // Listen for new pending transactions
      const cleanupTransactionListener = websocketService.addEventListener(
        'transaction:pending',
        (data) => {
          if (data.sender === wallet.address || data.receiver === wallet.address) {
            fetchTransactions();
          }
        }
      );
      
      return () => {
        cleanupBalanceListener();
        cleanupTransactionListener();
      };
    }
  }, [wallet?.address]);

  // Load wallet data (balance and transactions)
  const loadWalletData = async (address: string) => {
    try {
      setLoading(true);
      const balanceData = await walletApi.getBalance(address);
      const transactionsData = await walletApi.getTransactions(address);
      
      // Get wallet data from localStorage to access keys
      const walletData = localStorage.getItem('walletData');
      let mnemonic = '', privateKey = '', publicKey = '';
      
      if (walletData) {
        try {
          const parsedData = JSON.parse(walletData);
          mnemonic = parsedData.mnemonic || '';
          privateKey = parsedData.privateKey || '';
          publicKey = parsedData.publicKey || '';
        } catch (e) {
          console.error('Error parsing wallet data:', e);
        }
      }
      
      setWallet({
        address,
        balance: balanceData.balance,
        transactions: transactionsData,
        mnemonic,
        privateKey,
        publicKey
      });
      
      return {
        address,
        balance: balanceData.balance,
        transactions: transactionsData,
        mnemonic,
        privateKey,
        publicKey
      };
    } catch (err) {
      console.error('Error loading wallet data:', err);
      setError('Failed to load wallet data');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new wallet
  const createWallet = async (password: string): Promise<Wallet> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('WalletContext: Creating new wallet...');
      const response = await walletApi.createWallet();
      console.log('WalletContext: Wallet creation response:', response);
      
      if (!response || !response.address) {
        throw new Error('Invalid response: No address returned from API');
      }
      
      // Verify the mnemonic is present
      if (!response.mnemonic) {
        console.error('WalletContext: No mnemonic in response!', response);
        throw new Error('No mnemonic phrase returned from the API');
      }
      
      // Create wallet object with all data from RPC response
      const newWallet: Wallet = {
        address: response.address,
        mnemonic: response.mnemonic,
        privateKey: response.privateKey,
        publicKey: response.publicKey,
        balance: 0,
        transactions: []
      };
      
      console.log('WalletContext: Created wallet with address:', newWallet.address);
      console.log('WalletContext: Mnemonic present:', !!newWallet.mnemonic);
      
      // Store complete wallet info in localStorage for recovery
      // Note: In a real app, sensitive data should be encrypted with the password
      const walletData = {
        address: newWallet.address,
        publicKey: newWallet.publicKey,
        privateKey: newWallet.privateKey,
        mnemonic: newWallet.mnemonic
      };
      
      // Store wallet address for session tracking
      localStorage.setItem(WALLET_STORAGE_KEY, newWallet.address);
      
      // Store complete wallet data (should be encrypted in a real app)
      localStorage.setItem('walletData', JSON.stringify(walletData));
      console.log('WalletContext: Saved wallet data to localStorage');
      
      // Clear backup phrase confirmation to force user to see it
      localStorage.removeItem('backup_phrase_confirmed');
      
      setWallet(newWallet);
      return newWallet;
    } catch (err: any) {
      console.error('WalletContext: Error creating wallet:', err);
      const errorMessage = err.message || 'Failed to create wallet';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Import existing wallet
  const importWallet = async (mnemonic: string): Promise<Wallet> => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await walletApi.importWallet(mnemonic);
      
      if (!data.address) {
        throw new Error('No address returned from API');
      }
      
      localStorage.setItem(WALLET_STORAGE_KEY, data.address);
      
      // Load initial wallet data
      return await loadWalletData(data.address);
    } catch (err: any) {
      setError(err.message || 'Failed to import wallet');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch wallet balance
  const fetchBalance = async (address?: string, force?: boolean): Promise<number> => {
    try {
      setLoading(true);
      const targetAddress = address || wallet?.address;
      
      if (!targetAddress) {
        throw new Error('No wallet address');
      }
      
      const currentTime = Date.now();
      if (lastBalanceFetch.current[targetAddress] && !force && (currentTime - lastBalanceFetch.current[targetAddress] < THROTTLE_TIME)) {
        console.log('Balance request throttled, using cached data');
        // Just return the current balance without showing error
        return wallet?.balance || 0;
      }
      
      const data = await walletApi.getBalance(targetAddress);
      
      if (targetAddress === wallet?.address) {
        setWallet(prev => prev ? { ...prev, balance: data.balance } : null);
      }
      
      lastBalanceFetch.current[targetAddress] = currentTime;
      
      return data.balance;
    } catch (err: any) {
      // Don't set error for throttled requests
      if (err.message !== 'Throttled request') {
        setError(err.message || 'Failed to fetch balance');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch wallet transactions
  const fetchTransactions = async (address?: string, limit: number = 20, offset: number = 0, force?: boolean): Promise<any[]> => {
    try {
      setLoading(true);
      const targetAddress = address || wallet?.address;
      
      if (!targetAddress) {
        throw new Error('No wallet address');
      }
      
      const currentTime = Date.now();
      if (lastTransactionsFetch.current[targetAddress] && !force && (currentTime - lastTransactionsFetch.current[targetAddress] < THROTTLE_TIME)) {
        console.log('Transactions request throttled, using cached data');
        // Just return the current transactions without showing error
        return wallet?.transactions || [];
      }
      
      const data = await walletApi.getTransactions(targetAddress, limit, offset);
      
      if (targetAddress === wallet?.address) {
        setWallet(prev => prev ? { ...prev, transactions: data } : null);
      }
      
      lastTransactionsFetch.current[targetAddress] = currentTime;
      
      return data;
    } catch (err: any) {
      // Don't set error for throttled requests
      if (err.message !== 'Throttled request') {
        setError(err.message || 'Failed to fetch transactions');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Estimate transaction fee
  const estimateFee = async (to: string, amount: number): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!wallet?.address) {
        throw new Error('No wallet address');
      }
      
      console.log(`Estimating fee for transaction: ${wallet.address} -> ${to}, amount: ${amount}`);
      
      // Get available UTXOs and fee estimation
      const result = await walletApi.estimateFee(wallet.address, to, amount);
      
      // Format and return both fee data and available UTXOs for review
      return {
        fee: result.fee || 0.0001, // Default fee if not provided
        gasPrice: result.gasPrice || 20,
        gasLimit: result.gasLimit || 21000,
        utxos: result.utxos || [], // Available UTXOs for the transaction
        totalAvailable: result.totalAvailable || 0
      };
    } catch (err: any) {
      console.error('Fee estimation error:', err);
      setError(err.message || 'Failed to estimate fee');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create unsigned transaction
  const createUnsignedTransaction = async (to: string, amount: number, gasPrice = 20, gasLimit = 21000): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!wallet?.address) {
        throw new Error('No wallet address');
      }
      
      return await walletApi.createUnsignedTransaction(wallet.address, to, amount, gasPrice, gasLimit);
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign transaction
  const signTransaction = async (unsignedTx: any): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!wallet?.address) {
        throw new Error('No wallet address');
      }
      
      // Get mnemonic from localStorage
      const walletData = localStorage.getItem('walletData');
      if (!walletData) {
        throw new Error('Wallet data not found in local storage');
      }
      
      const parsedWalletData = JSON.parse(walletData);
      if (!parsedWalletData.mnemonic) {
        throw new Error('Mnemonic not found in wallet data');
      }
      
      return await walletApi.signTransaction(parsedWalletData.mnemonic, unsignedTx);
    } catch (err: any) {
      setError(err.message || 'Failed to sign transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Send signed transaction
  const sendSignedTransaction = async (signedTx: any): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!wallet?.address) {
        throw new Error('No wallet address');
      }
      
      const result = await walletApi.sendSignedTransaction(signedTx);
      
      // Refresh balance and transactions
      await fetchBalance();
      await fetchTransactions();
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to send transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Send transaction with key
  const sendTransactionWithKey = async (to: string, amount: number, gasPrice: number, gasLimit: number): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      
      if (!wallet?.address) {
        throw new Error('No wallet address');
      }
      
      // Get mnemonic from localStorage
      const walletData = localStorage.getItem('walletData');
      if (!walletData) {
        throw new Error('Wallet data not found in local storage');
      }
      
      const parsedWalletData = JSON.parse(walletData);
      if (!parsedWalletData.mnemonic) {
        throw new Error('Mnemonic not found in wallet data');
      }
      
      const result = await walletApi.sendTransactionWithKey(
        wallet.address, 
        to, 
        amount, 
        gasPrice, 
        gasLimit, 
        parsedWalletData.mnemonic
      );
      
      // Refresh balance and transactions
      await fetchBalance();
      await fetchTransactions();
      
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to send transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    localStorage.removeItem(WALLET_STORAGE_KEY);
    setWallet(null);
  };

  // Poll transaction status
  const pollTransactionStatus = async (txId: string, callback: (status: string, tx: any) => void): Promise<void> => {
    let attempts = 0;
    const maxAttempts = 18; // Poll for 90 seconds total (18 * 5s)
    
    const poll = async () => {
      try {
        const tx = await walletApi.getTransactionStatus(txId);
        callback(tx.status, tx);
        
        if (tx.status === 'confirmed' || tx.status === 'failed') {
          return; // Stop polling if transaction is confirmed or failed
        }
        
        if (++attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          callback('timeout', null); // Timeout after maxAttempts
        }
      } catch (err: any) {
        console.error('Error polling transaction status:', err);
        if (++attempts < maxAttempts) {
          setTimeout(poll, 5000); // Continue polling even if there's an error
        } else {
          callback('error', null); // Error after maxAttempts
        }
      }
    };
    
    poll(); // Start polling
  };

  const value = {
    wallet,
    loading,
    error,
    createWallet,
    importWallet,
    fetchBalance,
    fetchTransactions,
    estimateFee,
    createUnsignedTransaction,
    signTransaction,
    sendSignedTransaction,
    sendTransactionWithKey,
    pollTransactionStatus,
    disconnectWallet,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

// Custom hook for using the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  
  return context;
};

export default WalletContext; 