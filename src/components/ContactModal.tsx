import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface Contact {
  name: string;
  address: string;
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Contact) => void;
  initialContact?: Contact;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(10, 10, 20, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #181828;
  padding: 2.5rem 2rem 2rem 2rem;
  border-radius: 18px;
  width: 95%;
  max-width: 420px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ModalTitle = styled.h2`
  color: #fff;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  letter-spacing: 0.5px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  width: 100%;
`;

const Input = styled.input`
  padding: 1rem;
  border: 1.5px solid #282848;
  background: #23233a;
  border-radius: 8px;
  font-size: 1.08rem;
  color: #fff;
  outline: none;
  transition: border 0.2s;
  &:focus {
    border-color: #8a2be2;
  }
`;

const Button = styled.button`
  padding: 0.85rem 1.7rem;
  background: linear-gradient(90deg, #8a2be2 0%, #4a00e0 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.08rem;
  font-weight: 500;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(138,43,226,0.08);
  &:hover {
    background: linear-gradient(90deg, #4a00e0 0%, #8a2be2 100%);
    box-shadow: 0 4px 16px rgba(138,43,226,0.15);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: flex-end;
`;

const CancelButton = styled(Button)`
  background: #23233a;
  color: #bbb;
  border: 1.5px solid #282848;
  &:hover {
    background: #23233a;
    color: #fff;
    border-color: #8a2be2;
  }
`;

const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialContact
}) => {
  const [contact, setContact] = useState<Contact>({
    name: '',
    address: ''
  });

  useEffect(() => {
    if (initialContact) {
      setContact(initialContact);
    } else {
      setContact({ name: '', address: '' });
    }
  }, [initialContact, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(contact);
    setContact({ name: '', address: '' });
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalTitle>{initialContact ? 'Edit Contact' : 'Add New Contact'}</ModalTitle>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Contact Name"
            value={contact.name}
            onChange={e => setContact({ ...contact, name: e.target.value })}
            required
            autoFocus
          />
          <Input
            type="text"
            placeholder="Wallet Address"
            value={contact.address}
            onChange={e => setContact({ ...contact, address: e.target.value })}
            required
          />
          <ButtonGroup>
            <Button type="submit">Save Contact</Button>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ContactModal; 