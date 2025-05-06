import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, Button } from '../components/ui';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft, AlertTriangle } from '../utils/iconWrappers';

// Styled components - reusing styles from ConfirmGas.tsx for consistency
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

const TransactionSummary = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
  text-align: left;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
    padding-top: 12px;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    font-weight: 500;
  }
`;

const TxValue = styled.span`
  font-weight: 500;
`;

const WarningBox = styled.div`
  background-color: rgba(255, 152, 0, 0.1);
  border: 1px solid #ff9800;
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const WarningText = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 14px;
  margin-bottom: 16px;
`;

const FooterText = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 16px;
  text-align: center;
  line-height: 1.5;
`;

// Lock icon component
const LockIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11" stroke="#9B6DFF" strokeWidth="2" strokeLinecap="round"/>
    <rect x="5" y="11" width="14" height="10" rx="2" fill="#9B6DFF" fillOpacity="0.2" stroke="#9B6DFF" strokeWidth="2"/>
    <circle cx="12" cy="16" r="1" fill="#9B6DFF"/>
  </svg>
);

const SignTransaction: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const { sendTransactionWithKey, loading, error } = useWallet();
  const { showToast } = useToast();
  const [processingTx, setProcessingTx] = useState(false);
  
  // Parse transaction parameters from URL
  const from = query.get('from') || '';
  const to = query.get('to') || '';
  const amount = query.get('amount') || '0';
  const fee = query.get('fee') || '0';
  const gasPrice = query.get('gasPrice') || '20';
  const gasLimit = query.get('gasLimit') || '21000';
  
  // Calculate total amount
  const totalAmount = parseFloat(amount) + parseFloat(fee);
  
  // Format address for display (first 6 and last 4 chars)
  const formatAddress = (address: string): string => {
    if (!address) return '';
    if (address.length <= 13) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Handle cancel button - go back to confirmgas page
  const handleCancel = () => {
    navigate('/confirmgas' + location.search);
  };
  
  // Handle sign & send button
  const handleSignAndSend = async () => {
    if (!to || !amount) {
      showToast('Invalid transaction parameters', 'error');
      return;
    }
    
    try {
      setProcessingTx(true);
      
      // Send transaction with key
      const result = await sendTransactionWithKey(
        to,
        parseFloat(amount),
        parseInt(gasPrice, 10),
        parseInt(gasLimit, 10)
      );
      
      // Show toast with transaction ID in the specified format
      showToast(
        `Transaction sent waiting for confirmation\n${formatAddress(result.transactionId)}`,
        'success'
      );
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (err: any) {
      console.error('Error sending transaction:', err);
      showToast(err.message || 'Failed to send transaction', 'error');
      setProcessingTx(false);
    }
  };
  
  return (
    <DashboardLayout>
      <Container>
        <Header>
          <BackButton onClick={handleCancel}>
            <ArrowLeft />
          </BackButton>
          <Title>Sign Transaction</Title>
        </Header>
        
        <FormCard>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ marginBottom: '20px' }}>
              <LockIcon />
            </div>
            <p>Review and sign this transaction with your wallet keys</p>
            
            <TransactionSummary>
              <SummaryRow>
                <span>From:</span>
                <TxValue>{from ? formatAddress(from) : 'Unknown'}</TxValue>
              </SummaryRow>
              <SummaryRow>
                <span>To:</span>
                <TxValue>{formatAddress(to)}</TxValue>
              </SummaryRow>
              <SummaryRow>
                <span>Amount:</span>
                <TxValue>{parseFloat(amount)} SUP</TxValue>
              </SummaryRow>
              <SummaryRow>
                <span>Gas Price:</span>
                <TxValue>{gasPrice} gas token</TxValue>
              </SummaryRow>
              <SummaryRow>
                <span>Gas Limit:</span>
                <TxValue>{gasLimit}</TxValue>
              </SummaryRow>
              <SummaryRow>
                <span>Gas Fee:</span>
                <TxValue>{parseFloat(fee)} SUP</TxValue>
              </SummaryRow>
              <SummaryRow>
                <span>Total:</span>
                <TxValue>{totalAmount.toFixed(4)} SUP</TxValue>
              </SummaryRow>
            </TransactionSummary>
            
            <WarningBox>
              <AlertTriangle style={{ color: '#ff9800', flexShrink: 0, marginTop: '2px' }} />
              <WarningText>
                By signing this transaction, you authorize the transfer of {parseFloat(amount)} SUP
                plus a network fee of {parseFloat(fee)} SUP. This operation uses your
                private key and cannot be reversed once confirmed.
              </WarningText>
            </WarningBox>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <Button 
                variant="outlined" 
                onClick={handleCancel} 
                fullWidth
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSignAndSend}
                fullWidth
                disabled={loading || processingTx}
                style={{ 
                  background: '#9B6DFF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {loading || processingTx ? 'Processing...' : 'Sign & Send Transaction'}
              </Button>
            </div>
            
            <FooterText>
              Your signed transaction will be broadcast to the Supereum network for processing.
              Transaction details will be visible on the blockchain.
            </FooterText>
          </div>
        </FormCard>
      </Container>
    </DashboardLayout>
  );
};

export default SignTransaction; 