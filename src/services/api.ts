import axios from 'axios';
import { walletRpc, Transaction } from './rpcClient';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config for non-wallet API calls
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

/**
 * Wallet API - all wallet operations now use direct RPC calls
 * to the blockchain node instead of going through the server
 */
export const walletApi = {
  /**
   * Create a new wallet
   * @returns Object with address, privateKey, and mnemonic
   */
  createWallet: async () => {
    try {
      console.log('wallet API: Creating new wallet');
      const result = await walletRpc.createWallet();
      console.log('wallet API: Wallet created successfully', result);
      
      // Validate that we have all required wallet data
      if (!result.address) {
        console.error('wallet API: Missing address in response', result);
        throw new Error('Invalid wallet response: Missing address');
      }
      
      if (!result.mnemonic) {
        console.error('wallet API: Missing mnemonic in response', result);
        throw new Error('Invalid wallet response: Missing mnemonic phrase');
      }
      
      if (!result.privateKey) {
        console.error('wallet API: Missing privateKey in response', result);
        throw new Error('Invalid wallet response: Missing private key');
      }
      
      return result;
    } catch (error: any) {
      console.error('Error creating wallet:', error);
      // Re-throw the error with a more descriptive message
      throw new Error(`Failed to create wallet: ${error.message}`);
    }
  },

  /**
   * Import wallet from mnemonic
   * @param mnemonic The seed phrase to import
   * @returns Object with address and privateKey
   */
  importWallet: async (mnemonic: string) => {
    try {
      if (!mnemonic) {
        throw new Error('Mnemonic is required');
      }
      return await walletRpc.importWallet(mnemonic);
  } catch (error: any) {
      console.error('Error importing wallet:', error.message);
      throw new Error(`Failed to import wallet: ${error.message}`);
    }
  },

  /**
   * Get wallet information including balance
   * @param address The wallet address
   * @returns Object with address and balance
   */
  getWalletInfo: async (address: string) => {
    try {
      if (!address) {
        throw new Error('Address is required');
      }
      
      // Get balance
      const balance = await walletRpc.getBalance(address);
      
      return {
        address,
        balance
      };
    } catch (error: any) {
      console.error('Error getting wallet info:', error.message);
      throw new Error(`Failed to get wallet info: ${error.message}`);
    }
  },

  /**
   * Get wallet balance
   * @param address The wallet address
   * @returns Object with balance
   */
  getBalance: async (address: string) => {
    try {
      if (!address) {
        throw new Error('Address is required');
      }
      
      const balance = await walletRpc.getBalance(address);
      return { balance };
    } catch (error: any) {
      console.error('Error getting balance:', error.message);
      // For throttled requests, just return the last known balance to avoid error display
      if (error.message === 'Throttled request') {
        return { balance: 0 }; // Return zero or cached value
      }
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  },

  /**
   * Get transaction history
   * @param address The wallet address
   * @param limit Maximum number of transactions
   * @param offset Number of transactions to skip
   * @returns Array of transactions
   */
  getTransactions: async (address: string, limit: number = 20, offset: number = 0) => {
    try {
      if (!address) {
        throw new Error('Address is required');
      }
      
      const result = await walletRpc.getTransactionHistory(address, limit, offset, true);
      return result.transactions || [];
    } catch (error: any) {
      console.error('Error getting transactions:', error.message);
      throw new Error(`Failed to get transactions: ${error.message}`);
    }
  },

  /**
   * Send transaction - handles the full process of creating, signing, and sending
   * @param from Sender address
   * @param to Recipient address
   * @param amount Amount to send
   * @param mnemonic Mnemonic phrase for signing (should be handled securely)
   * @returns Transaction receipt
   */
  sendTransaction: async (from: string, to: string, amount: number, mnemonic: string) => {
    try {
      if (!from || !to || amount <= 0) {
        throw new Error('Valid from, to addresses and amount > 0 are required');
      }
      
      if (!mnemonic) {
        throw new Error('Mnemonic is required for signing');
      }
      
      // Step 1: Get the current nonce for the account
      const nonce = 0; // Normally you would get this from the blockchain
      
      // Step 2: Create an unsigned transaction
      const unsignedTx = await walletRpc.createUnsignedTransaction(
        from, 
        to, 
        amount
      );
      
      // Step 3: Sign the transaction using the mnemonic
      const signedTx = await walletRpc.signTransaction(mnemonic, unsignedTx);
      
      // Step 4: Send the signed transaction
      const sentTx = await walletRpc.sendTransaction({
        from,
        to, 
        amount,
        gasPrice: unsignedTx.gasPrice || 20,
        gasLimit: unsignedTx.gasLimit || 21000,
        timestamp: Math.floor(Date.now() / 1000),
        nonce,
        signature: signedTx.signature,
        publicKey: signedTx.publicKey,
        transactionId: signedTx.transactionId
      });
      
      return {
        txid: sentTx.transactionId,
        status: sentTx.status
      };
    } catch (error: any) {
      console.error('Error sending transaction:', error.message);
      throw new Error(`Failed to send transaction: ${error.message}`);
    }
  },

  /**
   * Estimate transaction fee
   * @param from Sender address
   * @param to Recipient address
   * @param amount Amount to send
   * @returns Estimated fee
   */
  estimateFee: async (from: string, to: string, amount: number) => {
    try {
      if (!from || !to || amount <= 0) {
        throw new Error('Valid from, to addresses and amount > 0 are required');
      }
      
      return await walletRpc.estimateFee(from, to, amount);
    } catch (error: any) {
      console.error('Error estimating fee:', error.message);
      throw new Error(`Failed to estimate fee: ${error.message}`);
    }
  },

  /**
   * Create an unsigned transaction
   * @param from Sender address
   * @param to Recipient address
   * @param amount Amount to send
   * @param gasPrice Gas price (optional)
   * @param gasLimit Gas limit (optional)
   * @returns Unsigned transaction object
   */
  createUnsignedTransaction: async (from: string, to: string, amount: number, gasPrice = 20, gasLimit = 21000) => {
    try {
      if (!from || !to || amount <= 0) {
        throw new Error('Valid from, to addresses and amount > 0 are required');
      }
      
      return await walletRpc.createUnsignedTransaction(from, to, amount, gasPrice, gasLimit);
    } catch (error: any) {
      console.error('Error creating unsigned transaction:', error.message);
      throw new Error(`Failed to create unsigned transaction: ${error.message}`);
    }
  },

  /**
   * Sign a transaction
   * @param mnemonic The mnemonic phrase for signing
   * @param unsignedTx The unsigned transaction object
   * @returns Signed transaction
   */
  signTransaction: async (mnemonic: string, unsignedTx: any) => {
    try {
      if (!mnemonic) {
        throw new Error('Mnemonic is required for signing');
      }
      
      if (!unsignedTx) {
        throw new Error('Unsigned transaction is required');
      }
      
      return await walletRpc.signTransaction(mnemonic, unsignedTx);
    } catch (error: any) {
      console.error('Error signing transaction:', error.message);
      throw new Error(`Failed to sign transaction: ${error.message}`);
    }
  },

  /**
   * Send a signed transaction
   * @param signedTx The signed transaction
   * @returns Transaction receipt
   */
  sendSignedTransaction: async (signedTx: any) => {
    try {
      if (!signedTx) {
        throw new Error('Signed transaction is required');
      }
      
      // Extract the transaction details from the signedTx object
      const { transaction, signature, senderPubKey, transactionId } = signedTx;
      
      if (!transaction || !signature || !senderPubKey || !transactionId) {
        throw new Error('Invalid signed transaction format');
      }
      
      return await walletRpc.sendTransaction({
        from: transaction.Sender,
        to: transaction.Receiver,
        amount: transaction.Amount,
        gasPrice: transaction.GasPrice,
        gasLimit: transaction.GasLimit,
        timestamp: transaction.Timestamp,
        nonce: transaction.Nonce,
        signature,
        publicKey: senderPubKey,
        transactionId
      });
    } catch (error: any) {
      console.error('Error sending signed transaction:', error.message);
      throw new Error(`Failed to send signed transaction: ${error.message}`);
    }
  },

  /**
   * Get transaction status
   * @param txId Transaction ID
   * @returns Transaction status and details
   */
  getTransactionStatus: async (txId: string) => {
    try {
      if (!txId) {
        throw new Error('Transaction ID is required');
      }
      
      return await walletRpc.getTransactionStatus(txId);
    } catch (error: any) {
      console.error('Error checking transaction status:', error.message);
      throw new Error(`Failed to check transaction status: ${error.message}`);
    }
  },
};

// Address Book API - still using the backend server
export const addressBookApi = {
  // Get all contacts
  getContacts: async () => {
    try {
      const response = await api.get('/addressbook');
      return response.data;
    } catch (error: any) {
      console.error('Error getting contacts:', error.message);
      throw new Error(`Failed to get contacts: ${error.message}`);
    }
  },

  // Add a new contact
  addContact: async (name: string, address: string, notes?: string) => {
    try {
      if (!name || !address) {
        throw new Error('Name and address are required');
      }
      
      const response = await api.post('/addressbook', {
        name,
        address,
        notes,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error adding contact:', error.message);
      throw new Error(`Failed to add contact: ${error.message}`);
    }
  },

  // Get a contact by ID
  getContact: async (id: string) => {
    try {
      if (!id) {
        throw new Error('Contact ID is required');
      }
      
      const response = await api.get(`/addressbook/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting contact:', error.message);
      throw new Error(`Failed to get contact: ${error.message}`);
    }
  },

  // Update a contact
  updateContact: async (id: string, name: string, address: string, notes?: string) => {
    try {
      if (!id || !name || !address) {
        throw new Error('Contact ID, name, and address are required');
      }
      
      const response = await api.put(`/addressbook/${id}`, {
        name,
        address,
        notes,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating contact:', error.message);
      throw new Error(`Failed to update contact: ${error.message}`);
    }
  },

  // Delete a contact
  deleteContact: async (id: string) => {
    try {
      if (!id) {
        throw new Error('Contact ID is required');
      }
      
      await api.delete(`/addressbook/${id}`);
      return true;
    } catch (error: any) {
      console.error('Error deleting contact:', error.message);
      throw new Error(`Failed to delete contact: ${error.message}`);
    }
  },
};

// Payment Requests API - still using the backend server
export const requestsApi = {
  // Get requests (incoming, outgoing, or both)
  getRequests: async (address: string, type?: 'incoming' | 'outgoing') => {
    try {
      if (!address) {
        throw new Error('Address is required');
      }
      
      const response = await api.get('/requests', {
        params: { address, type },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting payment requests:', error.message);
      throw new Error(`Failed to get payment requests: ${error.message}`);
    }
  },

  // Create a new payment request
  createRequest: async (from_address: string, to_address: string, amount: number, note?: string) => {
    try {
      if (!from_address || !to_address || amount <= 0) {
        throw new Error('From address, to address, and amount > 0 are required');
      }
      
      const response = await api.post('/requests', {
        from_address,
        to_address,
        amount,
        note,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating payment request:', error.message);
      throw new Error(`Failed to create payment request: ${error.message}`);
    }
  },

  // Get a payment request by ID
  getRequest: async (id: string) => {
    try {
      if (!id) {
        throw new Error('Request ID is required');
      }
      
      const response = await api.get(`/requests/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting payment request:', error.message);
      throw new Error(`Failed to get payment request: ${error.message}`);
    }
  },

  // Update payment request status
  updateRequestStatus: async (id: string, status: 'pending' | 'completed' | 'rejected' | 'expired', transaction_id?: string) => {
    try {
      if (!id || !status) {
        throw new Error('Request ID and status are required');
      }
      
      const response = await api.patch(`/requests/${id}/status`, {
        status,
        transaction_id,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating payment request status:', error.message);
      throw new Error(`Failed to update payment request status: ${error.message}`);
    }
  },

  // Delete a payment request
  deleteRequest: async (id: string) => {
    try {
      if (!id) {
        throw new Error('Request ID is required');
      }
      
      await api.delete(`/requests/${id}`);
      return true;
    } catch (error: any) {
      console.error('Error deleting payment request:', error.message);
      throw new Error(`Failed to delete payment request: ${error.message}`);
    }
  },
};

export default api; 