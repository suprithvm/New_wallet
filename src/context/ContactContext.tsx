import React, { createContext, useContext, useState, useEffect } from 'react';

interface Contact {
  name: string;
  address: string;
}

interface ContactContextType {
  contacts: Contact[];
  addContact: (contact: Contact) => void;
  editContact: (oldAddress: string, newContact: Contact) => void;
  deleteContact: (address: string) => void;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

const STORAGE_KEY = 'wallet_contacts';

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const savedContacts = localStorage.getItem(STORAGE_KEY);
    return savedContacts ? JSON.parse(savedContacts) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  }, [contacts]);

  const addContact = (contact: Contact) => {
    setContacts(prev => [...prev, contact]);
  };

  const editContact = (oldAddress: string, newContact: Contact) => {
    setContacts(prev =>
      prev.map(contact =>
        contact.address === oldAddress ? newContact : contact
      )
    );
  };

  const deleteContact = (address: string) => {
    setContacts(prev => prev.filter(contact => contact.address !== address));
  };

  return (
    <ContactContext.Provider
      value={{
        contacts,
        addContact,
        editContact,
        deleteContact,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
}; 