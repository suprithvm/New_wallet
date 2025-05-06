const express = require('express');
const router = express.Router();
const addressBookModel = require('../models/addressBook');

/**
 * Get all contacts
 * GET /api/addressbook
 */
router.get('/', async (req, res) => {
  try {
    const contacts = await addressBookModel.getAllContacts();
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: error.message || 'Failed to get contacts' });
  }
});

/**
 * Add a new contact
 * POST /api/addressbook
 */
router.post('/', async (req, res) => {
  try {
    const { name, address, notes } = req.body;
    
    if (!name || !address) {
      return res.status(400).json({ error: 'Name and address are required' });
    }
    
    const newContact = await addressBookModel.addContact({ name, address, notes });
    res.status(201).json(newContact);
  } catch (error) {
    console.error('Error adding contact:', error);
    res.status(500).json({ error: error.message || 'Failed to add contact' });
  }
});

/**
 * Get a specific contact
 * GET /api/addressbook/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await addressBookModel.getContactById(id);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.status(200).json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: error.message || 'Failed to get contact' });
  }
});

/**
 * Update a contact
 * PUT /api/addressbook/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, notes } = req.body;
    
    if (!name || !address) {
      return res.status(400).json({ error: 'Name and address are required' });
    }
    
    const updated = await addressBookModel.updateContact(id, { name, address, notes });
    
    if (!updated) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: error.message || 'Failed to update contact' });
  }
});

/**
 * Delete a contact
 * DELETE /api/addressbook/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await addressBookModel.deleteContact(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: error.message || 'Failed to delete contact' });
  }
});

module.exports = router; 