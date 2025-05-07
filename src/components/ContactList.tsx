import React from 'react';
import styled from 'styled-components';

interface Contact {
  name: string;
  address: string;
}

interface ContactListProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (address: string) => void;
  onSelect: (contact: Contact) => void;
}

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;

const ContactItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ContactName = styled.span`
  font-weight: 600;
  font-size: 1.1rem;
`;

const ContactAddress = styled.span`
  color: #6c757d;
  font-size: 0.9rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    opacity: 0.9;
  }
`;

const EditButton = styled(Button)`
  background-color: #28a745;
  color: white;
`;

const DeleteButton = styled(Button)`
  background-color: #dc3545;
  color: white;
`;

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  onEdit,
  onDelete,
  onSelect
}) => {
  return (
    <ListContainer>
      {contacts.map((contact) => (
        <ContactItem key={contact.address}>
          <ContactInfo onClick={() => onSelect(contact)}>
            <ContactName>{contact.name}</ContactName>
            <ContactAddress>{contact.address}</ContactAddress>
          </ContactInfo>
          <ButtonGroup>
            <EditButton onClick={() => onEdit(contact)}>
              Edit
            </EditButton>
            <DeleteButton onClick={() => onDelete(contact.address)}>
              Delete
            </DeleteButton>
          </ButtonGroup>
        </ContactItem>
      ))}
    </ListContainer>
  );
};

export default ContactList; 