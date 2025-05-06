const express = require('express');
const router = express.Router();
const requestsModel = require('../models/requests');

/**
 * Get all payment requests
 * GET /api/requests
 */
router.get('/', async (req, res) => {
  try {
    const { address, type } = req.query;
    let requests;
    
    if (address && type) {
      if (type === 'incoming') {
        requests = await requestsModel.getIncomingRequests(address);
      } else if (type === 'outgoing') {
        requests = await requestsModel.getOutgoingRequests(address);
      } else {
        return res.status(400).json({ error: 'Invalid request type' });
      }
    } else if (address) {
      // Get both incoming and outgoing if type not specified
      const incoming = await requestsModel.getIncomingRequests(address);
      const outgoing = await requestsModel.getOutgoingRequests(address);
      requests = { incoming, outgoing };
    } else {
      requests = await requestsModel.getAllRequests();
    }
    
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching payment requests:', error);
    res.status(500).json({ error: error.message || 'Failed to get payment requests' });
  }
});

/**
 * Create a new payment request
 * POST /api/requests
 */
router.post('/', async (req, res) => {
  try {
    const { from_address, to_address, amount, note } = req.body;
    
    if (!from_address || !to_address || !amount) {
      return res.status(400).json({ error: 'From address, to address, and amount are required' });
    }
    
    const newRequest = await requestsModel.createRequest({
      from_address,
      to_address,
      amount,
      note,
      status: 'pending',
      created_at: new Date(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });
    
    // Notify recipient via WebSocket if they're connected
    global.io.to(`wallet:${to_address}`).emit('request:new', newRequest);
    
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating payment request:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment request' });
  }
});

/**
 * Get a specific payment request
 * GET /api/requests/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const request = await requestsModel.getRequestById(id);
    
    if (!request) {
      return res.status(404).json({ error: 'Payment request not found' });
    }
    
    res.status(200).json(request);
  } catch (error) {
    console.error('Error fetching payment request:', error);
    res.status(500).json({ error: error.message || 'Failed to get payment request' });
  }
});

/**
 * Update payment request status
 * PATCH /api/requests/:id/status
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transaction_id } = req.body;
    
    if (!status || !['pending', 'completed', 'rejected', 'expired'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }
    
    const updated = await requestsModel.updateRequestStatus(id, status, transaction_id);
    
    if (!updated) {
      return res.status(404).json({ error: 'Payment request not found' });
    }
    
    // Notify both parties about the status change
    if (updated.from_address) {
      global.io.to(`wallet:${updated.from_address}`).emit('request:updated', updated);
    }
    if (updated.to_address) {
      global.io.to(`wallet:${updated.to_address}`).emit('request:updated', updated);
    }
    
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating payment request status:', error);
    res.status(500).json({ error: error.message || 'Failed to update payment request status' });
  }
});

/**
 * Delete a payment request
 * DELETE /api/requests/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await requestsModel.deleteRequest(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Payment request not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting payment request:', error);
    res.status(500).json({ error: error.message || 'Failed to delete payment request' });
  }
});

module.exports = router; 