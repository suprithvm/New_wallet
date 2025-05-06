const { pool } = require('../config/database');

/**
 * Get all contacts from the address book
 * @returns {Promise<Array>} List of contacts
 */
async function getAllContacts() {
  try {
    const [rows] = await pool.query('SELECT * FROM address_book ORDER BY name ASC');
    return rows;
  } catch (error) {
    console.error('Error getting contacts:', error);
    throw error;
  }
}

/**
 * Get a contact by ID
 * @param {number} id - Contact ID
 * @returns {Promise<Object|null>} Contact object or null if not found
 */
async function getContactById(id) {
  try {
    const [rows] = await pool.query('SELECT * FROM address_book WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error getting contact by ID:', error);
    throw error;
  }
}

/**
 * Get a contact by address
 * @param {string} address - Wallet address
 * @returns {Promise<Object|null>} Contact object or null if not found
 */
async function getContactByAddress(address) {
  try {
    const [rows] = await pool.query('SELECT * FROM address_book WHERE address = ?', [address]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error getting contact by address:', error);
    throw error;
  }
}

/**
 * Add a new contact to the address book
 * @param {Object} contact - Contact object with name, address, and optional notes
 * @returns {Promise<Object>} New contact with ID
 */
async function addContact(contact) {
  try {
    const { name, address, notes } = contact;
    
    // Check if address already exists
    const existing = await getContactByAddress(address);
    if (existing) {
      throw new Error('Contact with this address already exists');
    }
    
    const [result] = await pool.query(
      'INSERT INTO address_book (name, address, notes) VALUES (?, ?, ?)',
      [name, address, notes || null]
    );
    
    return {
      id: result.insertId,
      name,
      address,
      notes,
      created_at: new Date()
    };
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
}

/**
 * Update an existing contact
 * @param {number} id - Contact ID
 * @param {Object} contact - Updated contact details
 * @returns {Promise<Object|null>} Updated contact or null if not found
 */
async function updateContact(id, contact) {
  try {
    const { name, address, notes } = contact;
    
    // Check if contact exists
    const existing = await getContactById(id);
    if (!existing) {
      return null;
    }
    
    // Check if trying to update to an address that already exists on a different contact
    if (address !== existing.address) {
      const addressExists = await getContactByAddress(address);
      if (addressExists && addressExists.id !== parseInt(id)) {
        throw new Error('Another contact with this address already exists');
      }
    }
    
    await pool.query(
      'UPDATE address_book SET name = ?, address = ?, notes = ? WHERE id = ?',
      [name, address, notes || null, id]
    );
    
    return {
      id: parseInt(id),
      name,
      address,
      notes,
      updated_at: new Date()
    };
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
}

/**
 * Delete a contact
 * @param {number} id - Contact ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
async function deleteContact(id) {
  try {
    // Check if contact exists
    const existing = await getContactById(id);
    if (!existing) {
      return false;
    }
    
    const [result] = await pool.query('DELETE FROM address_book WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
}

/**
 * Search contacts by name or address
 * @param {string} query - Search query
 * @returns {Promise<Array>} List of matching contacts
 */
async function searchContacts(query) {
  try {
    const searchTerm = `%${query}%`;
    const [rows] = await pool.query(
      'SELECT * FROM address_book WHERE name LIKE ? OR address LIKE ? ORDER BY name ASC',
      [searchTerm, searchTerm]
    );
    return rows;
  } catch (error) {
    console.error('Error searching contacts:', error);
    throw error;
  }
}

module.exports = {
  getAllContacts,
  getContactById,
  getContactByAddress,
  addContact,
  updateContact,
  deleteContact,
  searchContacts
}; 