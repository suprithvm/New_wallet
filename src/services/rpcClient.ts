import axios from 'axios';

// Get the API URL from environment variables or use a default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// RPC endpoint on our own backend
const RPC_PROXY_ENDPOINT = `${API_URL}/rpc`;

console.log('Using RPC Proxy URL:', RPC_PROXY_ENDPOINT);

// Set up axios instance
const rpcClient = axios.create({
  baseURL: RPC_PROXY_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 second timeout for RPC calls
});

// Add request interceptor for debugging
rpcClient.interceptors.request.use(
  config => {
    console.log('RPC request:', config.method, config.url, config.data);
    return config;
  },
  error => {
    console.error('RPC request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
rpcClient.interceptors.response.use(
  response => {
    console.log('RPC response:', response.status, response.data);
    return response;
  },
  error => {
    if (error.response) {
      console.error('RPC response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('RPC no response received:', error.request);
    } else {
      console.error('RPC error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Define error types
export interface RPCError extends Error {
  code?: number;
  data?: any;
}

/**
 * Call the RPC API through our backend proxy to avoid CORS issues
 * @param method The RPC method to call
 * @param params Parameters to pass to the method
 * @returns The result from the RPC call
 */
const callRPC = async (method: string, params?: any): Promise<any> => {
  try {
    console.log(`Calling RPC method: ${method}`, params);
    
    // For JSON-RPC, params should be an array or object
    const jsonRpcParams = params || {};
    
    // Create the JSON-RPC 2.0 payload - sending to our own backend
    const payload = {
      jsonrpc: "2.0",
      method,
      params: jsonRpcParams,
      id: Date.now() // Use timestamp as unique ID
    };
    
    console.log('RPC payload:', payload);

    // Use axios to make the request to our backend proxy
    const response = await rpcClient.post('', payload);
    console.log('RPC response:', response.data);
    
    if (response.data.error) {
      const error = new Error(response.data.error.message || 'RPC Error') as RPCError;
      error.code = response.data.error.code;
      error.data = response.data.error.data;
      throw error;
    }
    
    return response.data.result;
  } catch (error: any) {
    console.error(`Error in RPC call (${method}):`, error.message);
    throw error;
  }
};

// Interface for transaction object
export interface Transaction {
  from: string;
  to: string;
  amount: number;
  gasPrice: number;
  gasLimit: number;
  timestamp: number;
  nonce: number;
  signature?: string;
  publicKey?: string;
  transactionId?: string;
}

// Interface for transaction history response
export interface TransactionHistoryResponse {
  transactions: Transaction[];
  total: number;
}

// Wallet API functions
export const walletRpc = {
  /**
   * Create a new wallet
   * @returns Object containing address, privateKey, and mnemonic
   */
  createWallet: async () => {
    return callRPC('createWallet');
  },

  /**
   * Import wallet from mnemonic phrase
   * @param mnemonic The mnemonic phrase to import
   * @returns Object containing address and privateKey
   */
  importWallet: async (mnemonic: string) => {
    if (!mnemonic) {
      throw new Error('Mnemonic is required');
    }
    return callRPC('importWallet', { mnemonic });
  },

  /**
   * Get wallet balance for an address
   * @param address The wallet address
   * @returns The balance as a number
   */
  getBalance: async (address: string): Promise<number> => {
    if (!address) {
      throw new Error('Address is required');
    }
    return callRPC('getBalance', { address });
  },

  /**
   * Get transaction history for an address
   * @param address The wallet address
   * @param limit Maximum number of transactions to return
   * @param offset Number of transactions to skip
   * @param sortDesc Sort by newest first if true
   * @returns Object containing transactions array and total count
   */
  getTransactionHistory: async (
    address: string, 
    limit = 10, 
    offset = 0, 
    sortDesc = true
  ): Promise<TransactionHistoryResponse> => {
    if (!address) {
      throw new Error('Address is required');
    }
    return callRPC('getTransactionHistory', {
      address,
      limit,
      offset,
      sortDesc
    });
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
  createUnsignedTransaction: async (
    from: string, 
    to: string, 
    amount: number, 
    gasPrice = 20, 
    gasLimit = 21000
  ): Promise<any> => {
    if (!from || !to || amount <= 0) {
      throw new Error('Valid from, to addresses and amount > 0 are required');
    }
    return callRPC('createUnsignedTransaction', {
      from,
      to,
      amount,
      gasPrice,
      gasLimit
    });
  },

  /**
   * Sign a transaction with a mnemonic phrase
   * @param mnemonic The mnemonic phrase for signing
   * @param unsignedTransaction The unsigned transaction object
   * @returns The signed transaction
   */
  signTransaction: async (mnemonic: string, unsignedTransaction: any) => {
    if (!mnemonic || !unsignedTransaction) {
      throw new Error('Mnemonic and unsigned transaction are required');
    }
    return callRPC('signTransaction', {
      mnemonic,
      unsignedTransaction
    });
  },

  /**
   * Send a signed transaction
   * @param transaction The transaction object with signature
   * @returns Transaction receipt
   */
  sendTransaction: async (transaction: Transaction) => {
    if (!transaction.from || !transaction.to || transaction.amount <= 0) {
      throw new Error('Valid from, to addresses and amount > 0 are required');
    }
    
    if (!transaction.signature) {
      throw new Error('Transaction signature is required');
    }
    
    return callRPC('sendTransaction', transaction);
  },
  
  /**
   * Estimate transaction fee
   * @param from Sender address
   * @param to Recipient address
   * @param amount Amount to send
   * @returns Object containing estimated fee details
   */
  estimateFee: async (from: string, to: string, amount: number) => {
    if (!from || !to || amount <= 0) {
      throw new Error('Valid from, to addresses and amount > 0 are required');
    }
    
    return callRPC('estimateFee', { from, to, amount });
  },

  /**
   * Send a transaction directly with wallet key (mnemonic)
   * This combines creating and signing the transaction in one RPC call
   * @param params Object containing transaction details and mnemonic
   * @returns Transaction receipt with transaction ID
   */
  sendTransactionWithKey: async (params: {
    from: string;
    to: string;
    amount: number;
    gasPrice: number;
    gasLimit: number;
    mnemonic: string;
  }) => {
    if (!params.from || !params.to || params.amount <= 0) {
      throw new Error('Valid from, to addresses and amount > 0 are required');
    }
    
    if (!params.mnemonic) {
      throw new Error('Mnemonic is required for signing the transaction');
    }
    
    return callRPC('sendTransactionWithKey', params);
  },
  
  /**
   * Get transaction status
   * @param txId Transaction ID
   * @returns The transaction status and details
   */
  getTransactionStatus: async (txId: string): Promise<any> => {
    if (!txId) {
      throw new Error('Transaction ID is required');
    }
    return callRPC('getTransactionStatus', { txId });
  }
};

export default walletRpc;