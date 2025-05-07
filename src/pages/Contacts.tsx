import React, { useState } from 'react';
import styled from 'styled-components';
import ContactModal from '../components/ContactModal';
import ContactList from '../components/ContactList';
import { useContacts } from '../context/ContactContext';

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.8rem;
`;

const AddButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background-color: #0056b3;
  }
`;

const Contacts: React.FC = () => {
  const { contacts, addContact, editContact, deleteContact } = useContacts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<{ name: string; address: string } | undefined>();

  const handleAddContact = () => {
    setEditingContact(undefined);
    setIsModalOpen(true);
  };

  const handleEditContact = (contact: { name: string; address: string }) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleSaveContact = (contact: { name: string; address: string }) => {
    if (editingContact) {
      editContact(editingContact.address, contact);
    } else {
      addContact(contact);
    }
    setIsModalOpen(false);
  };

  const handleSelectContact = (contact: { name: string; address: string }) => {
    // Handle contact selection (e.g., navigate to send page with pre-filled address)
    console.log('Selected contact:', contact);
  };

  return (
    <Container>
      <Header>
        <Title>Address Book</Title>
        <AddButton onClick={handleAddContact}>Add New Contact</AddButton>
      </Header>

      <ContactList
        contacts={contacts}
        onEdit={handleEditContact}
        onDelete={deleteContact}
        onSelect={handleSelectContact}
      />

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveContact}
        initialContact={editingContact}
      />
    </Container>
  );
};

export default Contacts; 