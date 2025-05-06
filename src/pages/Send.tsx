import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, Button, Input } from '../components/ui';
import TransactionReview from '../components/ui/TransactionReview';
import { useWallet } from '../contexts/WalletContext';
import { useAddressBook } from '../contexts/AddressBookContext';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft, User, Search, DollarSign, Check, AlertTriangle, ArrowRight } from '../utils/iconWrappers';

// Use URLSearchParams to get query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

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

const BalanceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 24px;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: 8px;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 14px;
  margin-bottom: 16px;
`;

const StatusContainer = styled.div<{ status: 'pending' | 'confirmed' | 'failed' | 'timeout' | 'error' | null }>`
  margin-top: 20px;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  
  background-color: ${({ status, theme }) => 
    status === 'confirmed' ? `${theme.colors.success}20` :
    status === 'failed' || status === 'error' ? `${theme.colors.error}20` :
    status === 'timeout' ? `${theme.colors.warning}20` :
    `${theme.colors.primary}20`
  };
  
  color: ${({ status, theme }) => 
    status === 'confirmed' ? theme.colors.success :
    status === 'failed' || status === 'error' ? theme.colors.error :
    status === 'timeout' ? theme.colors.warning :
    theme.colors.primary
  };
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  margin: 0 auto;
  animation: ${spin} 2s linear infinite;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  position: relative;
`;

const Step = styled.div<{ active: boolean; completed: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;
  
  &:first-child {
    align-items: flex-start;
  }
  
  &:last-child {
    align-items: flex-end;
  }
`;

const StepCircle = styled.div<{ active: boolean; completed: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  margin-bottom: 8px;
  background-color: ${({ active, completed, theme }) => 
    completed ? theme.colors.success :
    active ? theme.colors.primary :
    theme.colors.backgroundSecondary
  };
  color: ${({ active, completed, theme }) => 
    completed || active ? 'white' : theme.colors.textSecondary
  };
`;

const StepLine = styled.div<{ completed: boolean }>`
  position: absolute;
  height: 2px;
  top: 14px;
  left: 14px;
  right: 14px;
  background-color: ${({ completed, theme }) => 
    completed ? theme.colors.success : theme.colors.backgroundSecondary
  };
  z-index: 1;
`;

const StepLabel = styled.div<{ active: boolean; completed: boolean }>`
  font-size: 12px;
  font-weight: ${({ active }) => active ? '600' : '400'};
  color: ${({ active, completed, theme }) => 
    completed ? theme.colors.success :
    active ? theme.colors.primary : 
    theme.colors.textSecondary
  };
`;

const TransactionConfirmationCard = styled(Card)`
  padding: 24px;
  text-align: center;
`;

const SignTransactionButton = styled(Button)`
  margin-top: 20px;
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

const PrivacyNote = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 16px;
  line-height: 1.5;
`;

const Send: React.FC = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const { 
    wallet, 
    estimateFee, 
    createUnsignedTransaction, 
    signTransaction, 
    sendSignedTransaction,
    pollTransactionStatus,
    loading, 
    error 
  } = useWallet();
  const { contacts } = useAddressBook();
  const { showToast } = useToast();
  
  // Form input states
  const [to, setTo] = useState(query.get('to') || '');
  const [amount, setAmount] = useState(query.get('amount') || '');
  const [contactSearch, setContactSearch] = useState('');
  const [showContacts, setShowContacts] = useState(false);
  
  // Updated transaction flow states with more clearly defined steps
  const [stage, setStage] = useState<'form' | 'fee-estimate' | 'fee-confirmation' | 'transaction-creation' | 'transaction-review' | 'sign-transaction' | 'processing' | 'complete'>('form');
  const [formError, setFormError] = useState<string | null>(null);
  const [feeInfo, setFeeInfo] = useState<any>(null);
  const [unsignedTx, setUnsignedTx] = useState<any>(null);
  const [signedTx, setSignedTx] = useState<any>(null);
  const [txStatus, setTxStatus] = useState<'pending' | 'confirmed' | 'failed' | 'timeout' | 'error' | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  
  // Debug function to log state changes
  const debugLog = (message: string, data?: any) => {
    console.log(`[DEBUG] ${message}`, data || '');
  };
  
  // Track stage changes
  useEffect(() => {
    debugLog(`Stage changed to: ${stage}`);
  }, [stage]);
  
  // Track feeInfo changes
  useEffect(() => {
    if (feeInfo) {
      debugLog('Fee info updated:', feeInfo);
    }
  }, [feeInfo]);
  
  // Remove the automatic fee estimation on field changes
  // Automatically estimate fee when recipient and amount are provided
  useEffect(() => {
    // Reset form error when inputs change
    setFormError(null);
  }, [to, amount]);
  
  // Format address for display (first 6 and last 4 chars)
  const formatAddress = (address: string): string => {
    if (!address) return '';
    if (address.length <= 13) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.address.toLowerCase().includes(contactSearch.toLowerCase())
  );
  
  const handleContactSelect = (address: string) => {
    setTo(address);
    setShowContacts(false);
  };
  
  // Step 1: First only estimate the fee and show confirmation
  const handleSubmit = async (e?: React.FormEvent) => {
    // Prevent default if event is provided
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    setFormError(null);
    debugLog('handleSubmit called');
    
    // Validation
    if (!to) {
      setFormError('Recipient address is required');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setFormError('Amount must be greater than 0');
      return;
    }
    
    if (wallet && parseFloat(amount) > wallet.balance) {
      setFormError('Insufficient balance');
      return;
    }
    
    try {
      // Only estimate the fee in this step
      debugLog(`Estimating fee for transaction from ${wallet?.address} to ${to} for ${amount} SUP`);
      setStage('fee-estimate');
      
      // Clear any previous fee info
      setFeeInfo(null);
      
      const feeData = await estimateFee(to, parseFloat(amount));
      debugLog('Fee estimation response received:', feeData);
      
      // Ensure the fee data is valid
      if (!feeData || typeof feeData.fee === 'undefined') {
        throw new Error('Fee information is missing from the response');
      }
      
      // Set fee info in state
      setFeeInfo(feeData);
      
      // Important: Wait for state update to complete before changing stage
      // Use setTimeout to ensure state update has happened
      setTimeout(() => {
        debugLog('Moving to fee confirmation stage');
        setStage('fee-confirmation');
      }, 100);
    } catch (err: any) {
      console.error('Error estimating fee:', err);
      debugLog('Fee estimation error', err);
      setFormError(err.message || 'Failed to estimate transaction fee');
      setStage('form');
    }
  };
  
  // Step 2: After fee confirmation, create the unsigned transaction
  const handleFeeConfirm = async () => {
    try {
      debugLog('Fee confirmed, creating unsigned transaction');
      setStage('transaction-creation');
      
      if (!feeInfo) {
        throw new Error('Fee information is missing, cannot create transaction');
      }
      
      // Create the unsigned transaction only after fee confirmation
      const unsignedTransaction = await createUnsignedTransaction(
        to, 
        parseFloat(amount),
        feeInfo?.gasPrice || 20,
        feeInfo?.gasLimit || 21000
      );
      debugLog('Unsigned transaction created:', unsignedTransaction);
      
      setUnsignedTx(unsignedTransaction);
      
      // Wait for state update to complete before changing stage
      setTimeout(() => {
        debugLog('Moving to transaction review stage');
        setStage('transaction-review');
      }, 100);
    } catch (err: any) {
      console.error('Error creating transaction:', err);
      debugLog('Transaction creation error', err);
      setFormError(err.message || 'Failed to create transaction');
      setStage('fee-confirmation'); // Go back to fee confirmation on error
    }
  };
  
  // Step 3: Review the transaction details and confirm
  const handleReviewConfirm = () => {
    debugLog('Transaction review confirmed, moving to signing stage');
    setStage('sign-transaction');
  };
  
  // Step 4: Sign and send the transaction
  const handleSignTransaction = async () => {
    try {
      debugLog('Signing transaction');
      // Sign the transaction
      const signed = await signTransaction(unsignedTx);
      setSignedTx(signed);
      debugLog('Transaction signed successfully:', signed);
      
      // Send the signed transaction
      debugLog('Sending signed transaction');
      const result = await sendSignedTransaction(signed);
      setTxId(result.transactionId);
      setTxStatus('pending');
      debugLog('Transaction sent successfully, ID:', result.transactionId);
      
      // Set the processing stage
      setStage('processing');
      
      // Start polling for transaction status
      debugLog('Starting to poll transaction status');
      pollTransactionStatus(result.transactionId, (status, tx) => {
        debugLog(`Transaction status update: ${status}`, tx);
        
        if (status === 'confirmed') {
          setTxStatus('confirmed');
          setStage('complete');
          showToast('Transaction confirmed!', 'success');
        } else if (status === 'failed') {
          setTxStatus('failed');
          setStage('complete');
          showToast('Transaction failed', 'error');
        } else if (status === 'timeout') {
          setTxStatus('timeout');
          setStage('complete');
          showToast('Transaction status check timed out', 'info');
        } else if (status === 'error') {
          setTxStatus('error');
          setStage('complete');
          showToast('Error checking transaction status', 'error');
        }
      });
    } catch (err: any) {
      console.error('Error signing or sending transaction:', err);
      debugLog('Transaction signing/sending error', err);
      setFormError(err.message || 'Failed to send transaction');
      setStage('transaction-review');
    }
  };
  
  const handleCancel = () => {
    debugLog('Transaction cancelled, returning to form');
    setStage('form');
    setUnsignedTx(null);
    setFeeInfo(null);
    setFormError(null);
  };
  
  const handleBackToDashboard = () => {
    debugLog('Returning to dashboard');
    navigate('/dashboard');
  };
  
  // Calculate total amount including fee
  const totalAmount = feeInfo && amount 
    ? parseFloat(amount) + feeInfo.fee
    : parseFloat(amount || '0');
    
  // Determine which steps are completed or active
  const isStep1Active = stage === 'form' || stage === 'fee-estimate';
  const isStep1Completed = stage === 'fee-confirmation' || stage === 'transaction-creation' || stage === 'transaction-review' || stage === 'sign-transaction' || stage === 'processing' || stage === 'complete';
  
  const isStep2Active = stage === 'fee-confirmation' || stage === 'transaction-creation';
  const isStep2Completed = stage === 'transaction-review' || stage === 'sign-transaction' || stage === 'processing' || stage === 'complete';
  
  const isStep3Active = stage === 'transaction-review';
  const isStep3Completed = stage === 'sign-transaction' || stage === 'processing' || stage === 'complete';
  
  const isStep4Active = stage === 'sign-transaction';
  const isStep4Completed = stage === 'processing' || stage === 'complete';
  
  const isStep5Active = stage === 'processing' || stage === 'complete';
  const isStep5Completed = stage === 'complete';
  
  return (
    <DashboardLayout>
      <Container>
        <Header>
          <BackButton onClick={() => navigate('/dashboard')}>
            <ArrowLeft />
          </BackButton>
          <Title>Send Supereum</Title>
        </Header>
        
        {/* Only show steps indicator for transaction flow (not initial form) */}
        {stage !== 'form' && (
          <StepIndicator>
            <StepLine completed={isStep1Completed} />
            <Step active={isStep1Active} completed={isStep1Completed}>
              <StepCircle active={isStep1Active} completed={isStep1Completed}>
                {isStep1Completed ? <Check size={16} /> : 1}
              </StepCircle>
              <StepLabel active={isStep1Active} completed={isStep1Completed}>Fee</StepLabel>
            </Step>
            <Step active={isStep2Active} completed={isStep2Completed}>
              <StepCircle active={isStep2Active} completed={isStep2Completed}>
                {isStep2Completed ? <Check size={16} /> : 2}
              </StepCircle>
              <StepLabel active={isStep2Active} completed={isStep2Completed}>Create</StepLabel>
            </Step>
            <Step active={isStep3Active} completed={isStep3Completed}>
              <StepCircle active={isStep3Active} completed={isStep3Completed}>
                {isStep3Completed ? <Check size={16} /> : 3}
              </StepCircle>
              <StepLabel active={isStep3Active} completed={isStep3Completed}>Review</StepLabel>
            </Step>
            <Step active={isStep4Active} completed={isStep4Completed}>
              <StepCircle active={isStep4Active} completed={isStep4Completed}>
                {isStep4Completed ? <Check size={16} /> : 4}
              </StepCircle>
              <StepLabel active={isStep4Active} completed={isStep4Completed}>Sign</StepLabel>
            </Step>
            <Step active={isStep5Active} completed={isStep5Completed}>
              <StepCircle active={isStep5Active} completed={isStep5Completed}>
                {isStep5Completed ? <Check size={16} /> : 5}
              </StepCircle>
              <StepLabel active={isStep5Active} completed={isStep5Completed}>Confirm</StepLabel>
            </Step>
          </StepIndicator>
        )}
        
        {/* Step 1: Initial form */}
        {stage === 'form' && (
          <FormCard>
            <FormSubtitle>Send SUP tokens to any wallet address</FormSubtitle>
            
            <div>
              <div style={{ marginBottom: '20px' }}>
                <InputLabel>Send To (Address)</InputLabel>
                <Input
                  placeholder="Enter wallet address or select contact"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  icon={<User />}
                  fullWidth
                  onFocus={() => setShowContacts(true)}
                />
                
                {showContacts && (
                  <div style={{ 
                    marginTop: '8px', 
                    background: '#1a1a1a', 
                    borderRadius: '8px',
                    padding: '12px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {filteredContacts.length > 0 ? (
                      filteredContacts.map(contact => (
                        <div 
                          key={contact.id}
                          style={{ 
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            marginBottom: '4px'
                          }}
                          onClick={() => handleContactSelect(contact.address)}
                        >
                          <div style={{ fontWeight: 500 }}>{contact.name}</div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#999',
                            fontFamily: 'monospace'
                          }}>
                            {formatAddress(contact.address)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '12px' }}>
                        No contacts found
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <InputWithCurrency>
                <InputLabel>Amount</InputLabel>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  icon={<DollarSign />}
                  fullWidth
                  step="0.01"
                  min="0"
                />
                <CurrencyLabel>SUP</CurrencyLabel>
              </InputWithCurrency>
              
              <BalanceInfo>
                <div>Available Balance</div>
                <div>{wallet?.balance || 0} SUP</div>
              </BalanceInfo>
              
              {(formError || error) && (
                <ErrorMessage>
                  {formError || error}
                </ErrorMessage>
              )}
              
              <Button 
                type="button" 
                fullWidth 
                size="large"
                disabled={loading || !amount || !to}
                onClick={handleSubmit}
              >
                {loading ? 'Preparing...' : 'Continue'}
              </Button>
            </div>
          </FormCard>
        )}
        
        {/* Step 2: Fee estimation in progress */}
        {stage === 'fee-estimate' && (
          <FormCard>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <h3>Estimating Network Fee</h3>
              <p>Calculating the network fee for your transaction.</p>
              
              <div style={{ margin: '20px 0' }}>
                <Spinner />
              </div>
              
              <p>Please wait...</p>
            </div>
          </FormCard>
        )}
        
        {/* Step 3: Fee confirmation */}
        {stage === 'fee-confirmation' && feeInfo && (
          <FormCard>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <h3>Confirm Transaction Fee</h3>
              <p>Please review and confirm the network fee for your transaction.</p>
              
              <TransactionSummary>
                <SummaryRow>
                  <span>From:</span>
                  <TxValue>{wallet?.address ? formatAddress(wallet.address) : 'Unknown'}</TxValue>
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
                  <span>Network Fee:</span>
                  <TxValue>{feeInfo?.fee || 0} SUP</TxValue>
                </SummaryRow>
                <SummaryRow>
                  <span>Total:</span>
                  <TxValue>{totalAmount} SUP</TxValue>
                </SummaryRow>
              </TransactionSummary>
              
              {feeInfo?.utxos && feeInfo.utxos.length > 0 && (
                <div style={{ marginTop: '20px', textAlign: 'left' }}>
                  <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>Available UTXOs: {feeInfo.utxos.length}</h4>
                  <div style={{ 
                    maxHeight: '150px', 
                    overflowY: 'auto', 
                    background: '#1a1a1a', 
                    borderRadius: '8px', 
                    padding: '12px',
                    fontSize: '13px'
                  }}>
                    {feeInfo.utxos.map((utxo: any, idx: number) => (
                      <div key={idx} style={{ 
                        marginBottom: '8px', 
                        paddingBottom: '8px',
                        borderBottom: idx < feeInfo.utxos.length - 1 ? '1px solid #333' : 'none'
                      }}>
                        <div>Amount: {utxo.amount} SUP</div>
                        <div style={{ fontSize: '11px', fontFamily: 'monospace', opacity: 0.7, marginTop: '4px' }}>
                          TXID: {utxo.txid.substring(0, 16)}...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <Button 
                  variant="outlined" 
                  onClick={handleCancel} 
                  fullWidth
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleFeeConfirm}
                  fullWidth
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Confirm & Continue'}
                </Button>
              </div>
            </div>
          </FormCard>
        )}
        
        {/* Fallback if fee-confirmation stage is active but feeInfo isn't available yet */}
        {stage === 'fee-confirmation' && !feeInfo && (
          <FormCard>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <h3>Loading Fee Information</h3>
              <p>Waiting for fee information to load...</p>
              
              <div style={{ margin: '20px 0' }}>
                <Spinner />
              </div>
              
              <Button 
                variant="outlined" 
                onClick={handleCancel} 
                fullWidth
              >
                Cancel
              </Button>
            </div>
          </FormCard>
        )}
        
        {/* Step 4: Transaction creation in progress */}
        {stage === 'transaction-creation' && (
          <FormCard>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <h3>Creating Transaction</h3>
              <p>Preparing your transaction with the confirmed fee.</p>
              
              <div style={{ margin: '20px 0' }}>
                <Spinner />
              </div>
              
              <p>Please wait...</p>
            </div>
          </FormCard>
        )}
        
        {/* Step 5: Transaction review */}
        {stage === 'transaction-review' && feeInfo && unsignedTx && (
          <FormCard>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <h3>Review Transaction</h3>
              <p>Your transaction has been created. Please review the details before signing.</p>
              
              <TransactionSummary>
                <SummaryRow>
                  <span>From:</span>
                  <TxValue>{wallet?.address ? formatAddress(wallet.address) : 'Unknown'}</TxValue>
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
                  <TxValue>{unsignedTx.gasPrice || feeInfo.gasPrice} GWEI</TxValue>
                </SummaryRow>
                <SummaryRow>
                  <span>Gas Limit:</span>
                  <TxValue>{unsignedTx.gasLimit || feeInfo.gasLimit}</TxValue>
                </SummaryRow>
                <SummaryRow>
                  <span>Network Fee:</span>
                  <TxValue>{feeInfo?.fee || 0} SUP</TxValue>
                </SummaryRow>
                <SummaryRow>
                  <span>Total:</span>
                  <TxValue>{totalAmount} SUP</TxValue>
                </SummaryRow>
              </TransactionSummary>
              
              <div style={{ marginTop: '20px', textAlign: 'left' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '10px' }}>Transaction Data</h4>
                <div style={{ 
                  background: '#1a1a1a', 
                  borderRadius: '8px', 
                  padding: '12px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  wordBreak: 'break-all'
                }}>
                  {JSON.stringify(unsignedTx, null, 2)}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <Button 
                  variant="outlined" 
                  onClick={handleCancel} 
                  fullWidth
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleReviewConfirm}
                  fullWidth
                >
                  Proceed to Sign
                </Button>
              </div>
            </div>
          </FormCard>
        )}
        
        {/* Step 6: Transaction signing */}
        {stage === 'sign-transaction' && (
          <TransactionConfirmationCard>
            <h3 style={{ marginTop: 0 }}>Sign Transaction</h3>
            <p>Please approve this transaction with your wallet to complete the transfer.</p>
            
            <TransactionSummary>
              <SummaryRow>
                <span>From:</span>
                <TxValue>{wallet?.address ? formatAddress(wallet.address) : 'Unknown'}</TxValue>
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
                <span>Network Fee:</span>
                <TxValue>{feeInfo?.fee || 0} SUP</TxValue>
              </SummaryRow>
              <SummaryRow>
                <span>Total:</span>
                <TxValue>{totalAmount} SUP</TxValue>
              </SummaryRow>
            </TransactionSummary>
            
            <div style={{ 
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
              border: '1px solid #ff9800',
              borderRadius: '8px',
              padding: '12px',
              margin: '20px 0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <AlertTriangle style={{ color: '#ff9800', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '13px' }}>
                By signing this transaction, you are authorizing the transfer of {parseFloat(amount)} SUP plus a network fee of {feeInfo?.fee || 0} SUP. This action cannot be reversed once confirmed.
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button 
                variant="outlined" 
                onClick={handleCancel} 
                fullWidth
              >
                Cancel
              </Button>
              <SignTransactionButton 
                onClick={handleSignTransaction} 
                fullWidth
                disabled={loading}
              >
                {loading ? 'Signing...' : 'Sign & Send'} <ArrowRight size={16} style={{ marginLeft: '8px' }} />
              </SignTransactionButton>
            </div>
            
            <PrivacyNote>
              Your transaction will be broadcast to the Supereum network for processing. Transaction details will be visible on the blockchain.
            </PrivacyNote>
          </TransactionConfirmationCard>
        )}
        
        {/* Step 7: Processing transaction */}
        {stage === 'processing' && (
          <FormCard>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <h3>Processing Transaction</h3>
              <p>Your transaction has been signed and sent to the network.</p>
              <p>Transaction ID: <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>{txId}</span></p>
              
              <div style={{ margin: '20px 0' }}>
                <Spinner />
              </div>
              
              <p>Please wait while we check the transaction status...</p>
            </div>
          </FormCard>
        )}
        
        {/* Step 8: Transaction complete */}
        {stage === 'complete' && txStatus && (
          <FormCard>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <h3>
                {txStatus === 'confirmed' ? 'Transaction Complete' :
                 txStatus === 'failed' ? 'Transaction Failed' :
                 txStatus === 'timeout' ? 'Status Check Timeout' :
                 'Transaction Error'}
              </h3>
              
              <StatusContainer status={txStatus}>
                <p>
                  {txStatus === 'confirmed' ? 'Your transaction has been confirmed on the blockchain.' :
                   txStatus === 'failed' ? 'Your transaction has failed. Please try again.' :
                   txStatus === 'timeout' ? 'We couldn\'t confirm your transaction status in time. Check again later.' :
                   'There was an error processing your transaction.'}
                </p>
                <p style={{ marginTop: '10px' }}>Transaction ID: <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>{txId}</span></p>
              </StatusContainer>
              
              <div style={{ marginTop: '20px' }}>
                <Button 
                  fullWidth 
                  onClick={handleBackToDashboard}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </FormCard>
        )}
      </Container>
    </DashboardLayout>
  );
};

export default Send; 