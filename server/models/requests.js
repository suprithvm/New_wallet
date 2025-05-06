const { pool } = require('../config/database');

/**
 * Get all payment requests
 * @returns {Promise<Array>} List of payment requests
 */
async function getAllRequests() {
  try {
    const [rows] = await pool.query('SELECT * FROM payment_requests ORDER BY created_at DESC');
    return rows;
  } catch (error) {
    console.error('Error getting all payment requests:', error);
    throw error;
  }
}

/**
 * Get a payment request by ID
 * @param {number} id - Request ID
 * @returns {Promise<Object|null>} Payment request object or null if not found
 */
async function getRequestById(id) {
  try {
    const [rows] = await pool.query('SELECT * FROM payment_requests WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error getting payment request by ID:', error);
    throw error;
  }
}

/**
 * Get incoming payment requests for an address
 * @param {string} address - Recipient wallet address
 * @returns {Promise<Array>} List of incoming payment requests
 */
async function getIncomingRequests(address) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM payment_requests WHERE to_address = ? ORDER BY created_at DESC',
      [address]
    );
    return rows;
  } catch (error) {
    console.error('Error getting incoming payment requests:', error);
    throw error;
  }
}

/**
 * Get outgoing payment requests for an address
 * @param {string} address - Sender wallet address
 * @returns {Promise<Array>} List of outgoing payment requests
 */
async function getOutgoingRequests(address) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM payment_requests WHERE from_address = ? ORDER BY created_at DESC',
      [address]
    );
    return rows;
  } catch (error) {
    console.error('Error getting outgoing payment requests:', error);
    throw error;
  }
}

/**
 * Create a new payment request
 * @param {Object} request - Payment request object
 * @returns {Promise<Object>} Created payment request with ID
 */
async function createRequest(request) {
  try {
    const { from_address, to_address, amount, note, status, created_at, expires_at } = request;
    
    const [result] = await pool.query(
      `INSERT INTO payment_requests 
       (from_address, to_address, amount, note, status, created_at, expires_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [from_address, to_address, amount, note || null, status, created_at, expires_at]
    );
    
    return {
      id: result.insertId,
      from_address,
      to_address,
      amount,
      note,
      status,
      created_at,
      expires_at
    };
  } catch (error) {
    console.error('Error creating payment request:', error);
    throw error;
  }
}

/**
 * Update payment request status
 * @param {number} id - Request ID
 * @param {string} status - New status ('pending', 'completed', 'rejected', 'expired')
 * @param {string} transaction_id - Transaction ID if completed
 * @returns {Promise<Object|null>} Updated request or null if not found
 */
async function updateRequestStatus(id, status, transaction_id = null) {
  try {
    // Check if request exists
    const request = await getRequestById(id);
    if (!request) {
      return null;
    }
    
    await pool.query(
      'UPDATE payment_requests SET status = ?, transaction_id = ? WHERE id = ?',
      [status, transaction_id, id]
    );
    
    // Get the updated request
    return await getRequestById(id);
  } catch (error) {
    console.error('Error updating payment request status:', error);
    throw error;
  }
}

/**
 * Delete a payment request
 * @param {number} id - Request ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
async function deleteRequest(id) {
  try {
    // Check if request exists
    const request = await getRequestById(id);
    if (!request) {
      return false;
    }
    
    const [result] = await pool.query('DELETE FROM payment_requests WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting payment request:', error);
    throw error;
  }
}

/**
 * Check and expire old pending requests
 * @returns {Promise<number>} Number of expired requests
 */
async function cleanupExpiredRequests() {
  try {
    const [result] = await pool.query(
      `UPDATE payment_requests 
       SET status = 'expired' 
       WHERE status = 'pending' 
       AND expires_at < NOW()`
    );
    
    return result.affectedRows;
  } catch (error) {
    console.error('Error cleaning up expired requests:', error);
    throw error;
  }
}

module.exports = {
  getAllRequests,
  getRequestById,
  getIncomingRequests,
  getOutgoingRequests,
  createRequest,
  updateRequestStatus,
  deleteRequest,
  cleanupExpiredRequests
}; 