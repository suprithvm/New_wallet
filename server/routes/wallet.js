const express = require('express');
const { walletAPI, blockchainAPI } = require('../config/rpc');
const router = express.Router();

/**
 * Create a new wallet
 * POST /api/wallet/create
 */
router.post('/create', async (req, res) => {
  try {
    const result = await walletAPI.createWallet();
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ error: error.message || 'Failed to create wallet' });
  }
});

/**
 * Import an existing wallet
 * POST /api/wallet/import
 */
router.post('/import', async (req, res) => {
  try {
    const { mnemonic } = req.body;
    
    if (!mnemonic) {
      return res.status(400).json({ error: 'Mnemonic phrase is required' });
    }
    
    const result = await walletAPI.importWallet(mnemonic);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error importing wallet:', error);
    res.status(500).json({ error: error.message || 'Failed to import wallet' });
  }
});

/**
 * Get wallet information
 * GET /api/wallet/:address
 */
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await walletAPI.getBalance(address);
    res.status(200).json({ address, balance });
  } catch (error) {
    console.error('Error getting wallet info:', error);
    res.status(500).json({ error: error.message || 'Failed to get wallet information' });
  }
});

/**
 * Get wallet balance
 * GET /api/wallet/:address/balance
 */
router.get('/:address/balance', async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await walletAPI.getBalance(address);
    res.status(200).json({ address, balance });
  } catch (error) {
    console.error('Error getting balance:', error);
    res.status(500).json({ error: error.message || 'Failed to get balance' });
  }
});

/**
 * Get transaction history
 * GET /api/wallet/:address/transactions
 */
router.get('/:address/transactions', async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 20, offset = 0 } = req.query;
    
    const history = await walletAPI.getTransactionHistory(address, parseInt(limit), parseInt(offset));
    res.status(200).json(history);
  } catch (error) {
    console.error('Error getting transaction history:', error);
    res.status(500).json({ error: error.message || 'Failed to get transaction history' });
  }
});

/**
 * Create and send a transaction
 * POST /api/wallet/send
 */
router.post('/send', async (req, res) => {
  try {
    const { from, to, amount, gasPrice, gasLimit, signature } = req.body;
    
    if (!from || !to || !amount) {
      return res.status(400).json({ error: 'From address, to address, and amount are required' });
    }
    
    // Estimate fee if not provided
    if (!gasPrice || !gasLimit) {
      try {
        const feeEstimate = await blockchainAPI.estimateFee(from, to, amount);
        if (!gasPrice) req.body.gasPrice = feeEstimate.gasPrice;
        if (!gasLimit) req.body.gasLimit = feeEstimate.gasLimit;
      } catch (err) {
        console.warn('Fee estimation failed, using default values:', err.message);
      }
    }
    
    const result = await walletAPI.sendTransaction(
      from, 
      to, 
      amount, 
      req.body.gasPrice, 
      req.body.gasLimit, 
      signature
    );
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error sending transaction:', error);
    res.status(500).json({ error: error.message || 'Failed to send transaction' });
  }
});

/**
 * Estimate transaction fee
 * POST /api/wallet/estimate-fee
 */
router.post('/estimate-fee', async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    
    if (!from || !to || !amount) {
      return res.status(400).json({ error: 'From address, to address, and amount are required' });
    }
    
    const result = await blockchainAPI.estimateFee(from, to, amount);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error estimating fee:', error);
    res.status(500).json({ error: error.message || 'Failed to estimate fee' });
  }
});

module.exports = router; 