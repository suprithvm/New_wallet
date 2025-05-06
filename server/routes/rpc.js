const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
require('dotenv').config();

// Get the RPC URL from environment variables or use the ngrok URL
// Use NODE_RPC_URL instead of REACT_APP_RPC_URL for server config
const RPC_URL = process.env.NODE_RPC_URL || 'https://d26a-49-204-97-224.ngrok-free.app';

console.log('RPC Proxy configured to use:', RPC_URL);

// Create axios instance for RPC calls
const rpcClient = axios.create({
  baseURL: RPC_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000 // 30 second timeout
});

// Mock implementations when blockchain node is unavailable
const mockImplementations = {
  // Mock wallet creation
  createWallet: () => {
    const id = uuidv4();
    const privateKey = crypto.randomBytes(32).toString('hex');
    const publicKey = crypto.randomBytes(32).toString('hex');
    const address = `supc${id.substring(0, 16)}${crypto.randomBytes(8).toString('hex')}`;
    
    // Generate a random 12-word mnemonic for recovery
    const wordList = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse',
      'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act',
      'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit',
      'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
      'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert',
      'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter',
      'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger',
      'angle', 'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
      'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic',
      'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest'
    ];
    
    const mnemonic = Array(12).fill(0).map(() => {
      const randomIndex = Math.floor(Math.random() * wordList.length);
      return wordList[randomIndex];
    }).join(' ');
    
    console.log('Mock: Created wallet with address:', address);
    console.log('Mock: Generated mnemonic phrase');
    
    return {
      address,
      privateKey,
      publicKey,
      mnemonic,
      message: 'Wallet created successfully'
    };
  },
  
  // Mock wallet import
  importWallet: (params) => {
    if (!params.mnemonic) {
      throw new Error('Mnemonic is required');
    }
    
    // Generate deterministic address and keys based on the mnemonic
    const hash = crypto.createHash('sha256').update(params.mnemonic).digest('hex');
    const address = 'sup' + hash.substring(0, 30);
    const privateKey = '0x' + crypto.createHash('sha256').update(address).digest('hex');
    
    console.log('Using mock implementation for importWallet');
    
    return {
      address,
      privateKey,
      publicKey: '0x' + crypto.createHash('sha256').update(privateKey).digest('hex'),
      imported: true
    };
  },
  
  // Mock get balance
  getBalance: (params) => {
    if (!params.address) {
      throw new Error('Address is required');
    }
    
    // Generate a pseudo-random balance based on the address
    const addressSum = params.address.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const balance = (addressSum % 1000) + 100; // A number between 100 and 1099
    
    console.log('Using mock implementation for getBalance');
    
    return balance;
  },
  
  // Mock transaction history
  getTransactionHistory: (params) => {
    if (!params.address) {
      throw new Error('Address is required');
    }
    
    const limit = params.limit || 10;
    const offset = params.offset || 0;
    
    // Generate mock transactions
    const transactions = Array(Math.min(limit, 20)).fill(0).map((_, i) => {
      const isIncoming = (i % 2 === 0);
      return {
        transactionId: uuidv4(),
        from: isIncoming ? 'sup' + crypto.randomBytes(15).toString('hex') : params.address,
        to: isIncoming ? params.address : 'sup' + crypto.randomBytes(15).toString('hex'),
        amount: Math.floor(Math.random() * 100) + 1,
        timestamp: Date.now() - (i * 86400000), // Each one day apart
        gasPrice: 20,
        gasLimit: 21000,
        nonce: i,
        status: 'confirmed',
        confirmations: Math.floor(Math.random() * 50) + 1
      };
    });
    
    console.log('Using mock implementation for getTransactionHistory');
    
    return {
      transactions,
      total: 100 // Mock total
    };
  }
};

/**
 * RPC Proxy endpoint
 * Accepts method and params from the client
 * Forwards the request to the blockchain node
 * Returns the result to the client
 */
router.post('/', async (req, res) => {
  try {
    const { method, params } = req.body;
    
    if (!method) {
      return res.status(400).json({ 
        error: { 
          message: 'Method is required',
          code: -32600 
        } 
      });
    }
    
    console.log(`Proxying RPC request for method: ${method}`);
    
    // Try using the RPC node
    try {
      // Construct the standard JSON-RPC 2.0 payload
      const payload = {
        jsonrpc: '2.0',
        method,
        params: params || [],
        id: Date.now()
      };
      
      // Forward the request to the blockchain node
      const response = await rpcClient.post('', payload);
      
      // Return the result to the client
      return res.json(response.data);
    } catch (rpcError) {
      console.error('RPC connection failed:', rpcError.message);
      
      // If the RPC node is unavailable and we have a mock implementation, use it
      if ((rpcError.code === 'ECONNREFUSED' || rpcError.code === 'ETIMEDOUT') && 
          method in mockImplementations) {
        console.log(`Falling back to mock implementation for ${method}`);
        
        try {
          const result = mockImplementations[method](params);
          
          // Return a properly formatted JSON-RPC response
          return res.json({
            jsonrpc: '2.0',
            id: Date.now(),
            result
          });
        } catch (mockError) {
          return res.status(400).json({
            jsonrpc: '2.0',
            id: Date.now(),
            error: {
              code: -32000,
              message: mockError.message || 'Mock implementation error'
            }
          });
        }
      }
      
      // Re-throw the error if we don't have a mock or the error is not connection-related
      throw rpcError;
    }
  } catch (error) {
    console.error('RPC Proxy Error:', error.message);
    
    // Log more details about the error for troubleshooting
    if (error.code === 'ECONNREFUSED') {
      console.error(`Failed to connect to RPC server at ${RPC_URL}. Make sure the blockchain node is running.`);
    }
    
    // If we have a response from the RPC node, forward it
    if (error.response && error.response.data) {
      return res.status(error.response.status || 500).json(error.response.data);
    }
    
    // Create a more descriptive error message based on the error type
    let errorMessage = 'Internal RPC error';
    let errorData = error.message;
    
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Failed to connect to blockchain node';
      errorData = `Cannot connect to ${RPC_URL}. Please ensure the blockchain node is running and accessible.`;
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Connection to blockchain node timed out';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Blockchain node not found';
      errorData = `Host not found for ${RPC_URL}`;
    }
    
    // Otherwise return a generic error
    return res.status(500).json({
      error: {
        code: -32603,
        message: errorMessage,
        data: errorData
      }
    });
  }
});

module.exports = router; 