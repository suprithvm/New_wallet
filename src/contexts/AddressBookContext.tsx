import React, { createContext, useContext, useState, useEffect } from 'react';
import { addressBookApi } from '../services/api';

// Define types
interface Contact {
  id: number;
  name: string;
  address: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface AddressBookContextType {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  fetchContacts: () => Promise<Contact[]>;
  addContact: (name: string, address: string, notes?: string) => Promise<Contact>;
  updateContact: (id: number, name: string, address: string, notes?: string) => Promise<Contact>;
  deleteContact: (id: number) => Promise<boolean>;
  getContactByAddress: (address: string) => Contact | undefined;
}

// Create context
const AddressBookContext = createContext<AddressBookContextType | null>(null);

// Provider component
export const AddressBookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize contacts on mount
  useEffect(() => {
    fetchContacts();
  }, []);

  // Fetch all contacts
  const fetchContacts = async (): Promise<Contact[]> => {
    try {
      setLoading(true);
      const data = await addressBookApi.getContacts();
      setContacts(data || []);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contacts');
      console.error('Error fetching contacts:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add a new contact
  const addContact = async (name: string, address: string, notes?: string): Promise<Contact> => {
    try {
      setLoading(true);
      const newContact = await addressBookApi.addContact(name, address, notes);
      setContacts(prev => [...prev, newContact]);
      return newContact;
    } catch (err: any) {
      setError(err.message || 'Failed to add contact');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing contact
  const updateContact = async (id: number, name: string, address: string, notes?: string): Promise<Contact> => {
    try {
      setLoading(true);
      const updatedContact = await addressBookApi.updateContact(id.toString(), name, address, notes);
      
      setContacts(prev => 
        prev.map(contact => 
          contact.id === id ? updatedContact : contact
        )
      );
      
      return updatedContact;
    } catch (err: any) {
      setError(err.message || 'Failed to update contact');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a contact
  const deleteContact = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      await addressBookApi.deleteContact(id.toString());
      setContacts(prev => prev.filter(contact => contact.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete contact');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Find a contact by address
  const getContactByAddress = (address: string): Contact | undefined => {
    return contacts.find(contact => contact.address === address);
  };

  const value = {
    contacts,
    loading,
    error,
    fetchContacts,
    addContact,
    updateContact,
    deleteContact,
    getContactByAddress,
  };

  return <AddressBookContext.Provider value={value}>{children}</AddressBookContext.Provider>;
};

// Custom hook for using the address book context
export const useAddressBook = () => {
  const context = useContext(AddressBookContext);
  
  if (!context) {
    throw new Error('useAddressBook must be used within an AddressBookProvider');
  }
  
  return context;
};

export default AddressBookContext; 