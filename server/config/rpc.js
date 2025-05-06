const axios = require('axios');

// Configure the RPC endpoint
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';

// Create a reusable axios instance for RPC calls
const rpcClient = axios.create({
  baseURL: RPC_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Make a JSON-RPC call to the blockchain node
 * @param {string} method - The RPC method to call
 * @param {Array|Object} params - The parameters to pass to the method
 * @returns {Promise<any>} - The response data
 */
async function callRPC(method, params = []) {
  try {
    const response = await rpcClient.post('', {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params: Array.isArray(params) ? params : [params]
    });

    if (response.data.error) {
      throw new Error(response.data.error.message || 'RPC Error');
    }

    return response.data.result;
  } catch (error) {
    console.error(`RPC Error (${method}):`, error.message);
    throw error;
  }
}

// Wallet methods
const walletAPI = {
  async createWallet() {
    return callRPC('createWallet');
  },
  
  async importWallet(mnemonic) {
    return callRPC('importWallet', { mnemonic });
  },
  
  async getWalletInfo(address) {
    return callRPC('getWalletInfo', { address });
  },
  
  async getBalance(address) {
    return callRPC('getBalance', { address });
  },
  
  async getTransactionHistory(address, limit = 20, offset = 0) {
    return callRPC('getTransactionHistory', { address, limit, offset });
  },
  
  async sendTransaction(from, to, amount, gasPrice = null, gasLimit = null, signature = null) {
    return callRPC('sendTransaction', { from, to, amount, gasPrice, gasLimit, signature });
  },
  
  async signTransaction(privateKey, from, to, amount, gasPrice = null, gasLimit = null) {
    return callRPC('signTransaction', { privateKey, from, to, amount, gasPrice, gasLimit });
  }
};

// Blockchain info methods
const blockchainAPI = {
  async getChainInfo() {
    return callRPC('getChainInfo');
  },
  
  async getBlockCount() {
    return callRPC('getBlockCount');
  },
  
  async getPendingTransactions() {
    return callRPC('getPendingTransactions');
  },
  
  async estimateFee(from, to, amount) {
    return callRPC('estimateFee', { from, to, amount });
  }
};

module.exports = {
  callRPC,
  walletAPI,
  blockchainAPI
}; 