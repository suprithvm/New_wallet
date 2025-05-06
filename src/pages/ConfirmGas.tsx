import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, Button } from '../components/ui';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft, AlertTriangle } from '../utils/iconWrappers';

// Styled components - reusing styles from Send.tsx for consistency
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

const ConfirmGas: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const { createUnsignedTransaction, loading, error } = useWallet();
  const { showToast } = useToast();
  const [processingTx, setProcessingTx] = useState(false);
  
  // Parse transaction parameters from URL
  const from = query.get('from') || '';
  const to = query.get('to') || '';
  const amount = query.get('amount') || '0';
  const fee = query.get('fee') || '0';
  const gasPrice = query.get('gasPrice') || '20';
  const gasLimit = query.get('gasLimit') || '21000';
  let utxos: any[] = [];
  
  try {
    const utxosString = query.get('utxos');
    if (utxosString) {
      utxos = JSON.parse(utxosString);
    }
  } catch (err) {
    console.error('Error parsing UTXOs:', err);
  }
  
  // Calculate total amount
  const totalAmount = parseFloat(amount) + parseFloat(fee);
  
  // Format address for display (first 6 and last 4 chars)
  const formatAddress = (address: string): string => {
    if (!address) return '';
    if (address.length <= 13) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Handle cancel button - go back to send page
  const handleCancel = () => {
    navigate('/send');
  };
  
  // Handle confirm button - create transaction and move to next step
  const handleConfirm = async () => {
    if (!to || !amount) {
      showToast('Invalid transaction parameters', 'error');
      return;
    }
    
    try {
      // Redirect to SignTransaction page with all parameters
      navigate(`/signTransaction${location.search}`);
    } catch (err: any) {
      console.error('Error navigating to sign transaction:', err);
      showToast(err.message || 'Failed to proceed to transaction signing', 'error');
    }
  };
  
  return (
    <DashboardLayout>
      <Container>
        <Header>
          <BackButton onClick={handleCancel}>
            <ArrowLeft />
          </BackButton>
          <Title>Confirm Transaction</Title>
        </Header>
        
        <FormCard>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <h3>Confirm Transaction Fee</h3>
            <p>Review and confirm transaction details before proceeding</p>
            
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
                <span>Network Fee:</span>
                <TxValue>{parseFloat(fee)} SUP</TxValue>
              </SummaryRow>
              <SummaryRow>
                <span>Total:</span>
                <TxValue>{totalAmount.toFixed(4)} SUP</TxValue>
              </SummaryRow>
            </TransactionSummary>
            
            {utxos && utxos.length > 0 && (
              <div style={{ marginTop: '20px', textAlign: 'left' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>Available UTXOs: {utxos.length}</h4>
                <div style={{ 
                  maxHeight: '150px', 
                  overflowY: 'auto', 
                  background: '#1a1a1a', 
                  borderRadius: '8px', 
                  padding: '12px',
                  fontSize: '13px'
                }}>
                  {utxos.map((utxo: any, idx: number) => (
                    <div key={idx} style={{ 
                      marginBottom: '8px', 
                      paddingBottom: '8px',
                      borderBottom: idx < utxos.length - 1 ? '1px solid #333' : 'none'
                    }}>
                      <div>Amount: {utxo.amount} SUP</div>
                      <div style={{ fontSize: '11px', fontFamily: 'monospace', opacity: 0.7, marginTop: '4px' }}>
                        TXID: {utxo.txid ? utxo.txid.substring(0, 16) : 'N/A'}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <WarningBox>
              <AlertTriangle style={{ color: '#ff9800', flexShrink: 0, marginTop: '2px' }} />
              <WarningText>
                By confirming this transaction, you authorize a transfer of {parseFloat(amount)} SUP
                plus a network fee of {parseFloat(fee)} SUP. This action cannot be
                reversed once submitted.
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
                onClick={handleConfirm}
                fullWidth
                disabled={loading || processingTx}
              >
                {loading || processingTx ? 'Processing...' : 'Confirm & Continue'}
              </Button>
            </div>
          </div>
        </FormCard>
      </Container>
    </DashboardLayout>
  );
};

export default ConfirmGas; 