import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiArrowLeft, FiDollarSign, FiMessageSquare } from 'react-icons/fi';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, Button, Input } from '../components/ui';
import { useWallet } from '../contexts/WalletContext';
import { useRequests } from '../contexts/RequestsContext';
import { ArrowLeft, DollarSign } from '../utils/iconWrappers';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 500px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`;

const FormCard = styled(Card)`
  padding: 24px;
  width: 100%;
`;

const FormSubtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 24px;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const InputWithCurrency = styled.div`
  position: relative;
  margin-bottom: 24px;
  
  input {
    padding-right: 60px;
  }
`;

const CurrencyLabel = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text};
  font-family: inherit;
  font-size: 14px;
  resize: none;
  margin-bottom: 24px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.7;
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 14px;
  margin-bottom: 16px;
`;

const SuccessCard = styled(Card)`
  padding: 24px;
  text-align: center;
  margin-top: 20px;
`;

const SuccessIcon = styled.div`
  font-size: 48px;
  color: ${({ theme }) => theme.colors.success};
  margin-bottom: 16px;
`;

const SuccessTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const SuccessMessage = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 24px;
`;

const Request: React.FC = () => {
  const navigate = useNavigate();
  const { wallet } = useWallet();
  const { createRequest, loading, error } = useRequests();
  
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Reset form error when inputs change
  useEffect(() => {
    setFormError(null);
  }, [to, amount]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Validation
    if (!to) {
      setFormError('Recipient address is required');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setFormError('Amount must be greater than 0');
      return;
    }
    
    try {
      await createRequest(to, parseFloat(amount), note);
      setIsSuccess(true);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create payment request');
    }
  };
  
  // Success view after request is created
  if (isSuccess) {
    return (
      <DashboardLayout>
        <Container>
          <Header>
            <BackButton onClick={() => navigate('/dashboard')}>
              <ArrowLeft />
            </BackButton>
            <Title>Request Supereum</Title>
          </Header>
          
          <SuccessCard>
            <SuccessIcon>✓</SuccessIcon>
            <SuccessTitle>Request Sent Successfully</SuccessTitle>
            <SuccessMessage>
              Your payment request has been sent. You will be notified when it is processed.
            </SuccessMessage>
            
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
              fullWidth
            >
              Back to Dashboard
            </Button>
          </SuccessCard>
        </Container>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <Container>
        <Header>
          <BackButton onClick={() => navigate('/dashboard')}>
            <ArrowLeft />
          </BackButton>
          <Title>Request Supereum</Title>
        </Header>
        
        <FormCard>
          <FormSubtitle>Request SUP tokens from others</FormSubtitle>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <InputLabel>Request From (Address)</InputLabel>
              <Input
                placeholder="Enter wallet address"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                fullWidth
              />
            </div>
            
            <InputLabel>Amount</InputLabel>
            <InputWithCurrency>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                fullWidth
                icon={<DollarSign />}
              />
              <CurrencyLabel>SUP</CurrencyLabel>
            </InputWithCurrency>
            
            <InputLabel>Note (Optional)</InputLabel>
            <TextArea
              placeholder="Add a message for the sender"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            
            {(formError || error) && (
              <ErrorMessage>
                {formError || error}
              </ErrorMessage>
            )}
            
            <Button
              type="submit"
              fullWidth
              size="large"
              disabled={loading}
            >
              {loading ? 'Creating Request...' : 'Generate Request'}
            </Button>
          </form>
        </FormCard>
      </Container>
    </DashboardLayout>
  );
};

export default Request; 