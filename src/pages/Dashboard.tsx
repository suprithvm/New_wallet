import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiSend, FiDownload, FiFileText, FiPlus } from 'react-icons/fi';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui';
import { useWallet } from '../contexts/WalletContext';
import { useAddressBook } from '../contexts/AddressBookContext';
import { useRequests } from '../contexts/RequestsContext';
import { Send, Download, FileText, Plus } from '../utils/iconWrappers';
import { useToast } from '../contexts/ToastContext';

const DashboardContainer = styled.div`
  width: 100%;
  max-width: 100%;
  
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const BalanceCard = styled(Card)`
  background: linear-gradient(135deg, #8a2be2 0%, #4a00e0 100%);
  margin-bottom: 20px;
  color: white;
  position: relative;
  
  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 12px;
  }
`;

const RefreshButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    transition: transform 0.5s;
  }
`;

const RotatingIcon = styled.span<{ isRefreshing: boolean }>`
  display: inline-flex;
  animation: ${({ isRefreshing }) => isRefreshing ? 'rotate 1s linear infinite' : 'none'};
  
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const TokenName = styled.div`
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 4px;
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-bottom: 20px;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4CAF50;
  margin-right: 8px;
`;

const BalanceAmount = styled.div`
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 4px;
  
  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

const FiatEquivalent = styled.div`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
`;

const AddressContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
`;

const Address = styled.div`
  font-size: 14px;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.9);
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.8;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

const ActionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
`;

const ActionButton = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  cursor: pointer;
  text-align: center;
  
  svg {
    font-size: 24px;
    margin-bottom: 12px;
    color: ${({ theme }) => theme.colors.primary};
  }
  
  @media (max-width: 768px) {
    padding: 16px 12px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 8px;
    
    svg {
      font-size: 20px;
      margin-bottom: 8px;
    }
  }
`;

const ActionTitle = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
  
  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 2px;
  }
`;

const ActionDescription = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  
  @media (max-width: 480px) {
    font-size: 11px;
    display: none; /* Hide on very small screens */
  }
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 20px;
`;

const Tab = styled.div<{ active: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 2px solid ${({ active, theme }) => 
    active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => 
    active ? theme.colors.text : theme.colors.textSecondary};
  font-weight: ${({ active }) => active ? '500' : '400'};
  transition: all 0.2s;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ContactsList = styled.div`
  display: grid;
  gap: 12px;
`;

const ContactItem = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
`;

const ContactIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: 18px;
  margin-right: 12px;
`;

const ContactInfo = styled.div`
  flex: 1;
`;

const ContactName = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const ContactAddress = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: monospace;
`;

const SendButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const PendingList = styled.div`
  display: grid;
  gap: 12px;
`;

const PendingItem = styled(Card)`
  display: flex;
  flex-direction: column;
  padding: 16px;
`;

const PendingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const PendingAmount = styled.div`
  font-weight: 500;
  font-size: 18px;
`;

const PendingActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActivityList = styled.div`
  margin-top: 8px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ActivityIcon = styled.div<{ type: 'sent' | 'received' | 'pending' | 'failed' }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  margin-right: 16px;
  flex-shrink: 0;
  
  background-color: ${({ type, theme }) => 
    type === 'sent' ? `${theme.colors.error}20` : 
    type === 'received' ? `${theme.colors.success}20` :
    type === 'pending' ? `${theme.colors.warning}20` :
    `${theme.colors.error}20`
  };
  
  color: ${({ type, theme }) => 
    type === 'sent' ? theme.colors.error : 
    type === 'received' ? theme.colors.success :
    type === 'pending' ? theme.colors.warning :
    theme.colors.error
  };
`;

const ActivityInfo = styled.div`
  flex-grow: 1;
  margin-right: 16px;
`;

const ActivityTitle = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
`;

const ActivityStatus = styled.div<{ status: 'confirmed' | 'pending' | 'failed' }>`
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 8px;
  
  background-color: ${({ status, theme }) => 
    status === 'confirmed' ? `${theme.colors.success}20` : 
    status === 'pending' ? `${theme.colors.warning}20` :
    `${theme.colors.error}20`
  };
  
  color: ${({ status, theme }) => 
    status === 'confirmed' ? theme.colors.success : 
    status === 'pending' ? theme.colors.warning :
    theme.colors.error
  };
`;

const ActivityDetails = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ActivityDate = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
`;

const ActivityAmount = styled.div<{ type: 'sent' | 'received' | 'pending' | 'failed' }>`
  font-weight: 500;
  font-size: 16px;
  text-align: right;
  
  color: ${({ type, theme }) => 
    type === 'sent' ? theme.colors.error : 
    type === 'received' ? theme.colors.success :
    type === 'pending' ? theme.colors.warning :
    theme.colors.error
  };
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { wallet, fetchBalance, loading } = useWallet();
  const { contacts } = useAddressBook();
  const { incomingRequests } = useRequests();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'contacts' | 'pending' | 'activity'>('contacts');
  const [refreshing, setRefreshing] = useState(false);
  
  // Reference to track if this is the initial mount
  const initialMount = useRef(true);
  
  useEffect(() => {
    // Only fetch on initial mount, not on every re-render
    if (wallet?.address && initialMount.current) {
      initialMount.current = false;
      
      const refreshData = async () => {
        try {
          setRefreshing(true);
          await fetchBalance();
        } catch (error) {
          console.error('Error refreshing balance:', error);
        } finally {
          setRefreshing(false);
        }
      };
      
      refreshData();
    }
  }, [wallet?.address]);
  
  // Manual refresh function that users can trigger
  const handleRefresh = async () => {
    if (wallet?.address && !refreshing) {
      try {
        setRefreshing(true);
        await fetchBalance(wallet.address, true); // Force refresh
        showToast('Balance updated', 'success');
      } catch (error) {
        console.error('Error refreshing balance:', error);
        showToast('Failed to update balance', 'error');
      } finally {
        setRefreshing(false);
      }
    }
  };
  
  // Format address for display (first 6 and last 4 chars)
  const formatAddress = (address: string): string => {
    if (!address) return '';
    if (address.length <= 13) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      showToast('Address copied to clipboard', 'success');
    }
  };
  
  // Format amount with token symbol
  const formatAmount = (amount: number): string => {
    return `${amount.toLocaleString()} SUP`;
  };
  
  return (
    <DashboardLayout>
      <DashboardContainer>
        <BalanceCard>
          <TokenName>SUPEREUM</TokenName>
          <ConnectionStatus>
            <StatusDot />
            Connected
          </ConnectionStatus>
          
          <RefreshButton onClick={handleRefresh} disabled={refreshing || loading}>
            <RotatingIcon isRefreshing={refreshing || loading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
              </svg>
            </RotatingIcon>
          </RefreshButton>
          
          <BalanceAmount>{wallet?.balance ? wallet.balance.toLocaleString() : '0'} SUP</BalanceAmount>
          <FiatEquivalent>Equivalent to $0.00</FiatEquivalent>
          
          <AddressContainer>
            <Address>{wallet?.address ? formatAddress(wallet.address) : 'Unknown'}</Address>
            <CopyButton onClick={copyAddress}>Copy</CopyButton>
          </AddressContainer>
        </BalanceCard>
        
        <ActionsContainer>
          <ActionButton onClick={() => navigate('/send')}>
            <Send />
            <ActionTitle>Send</ActionTitle>
            <ActionDescription>Send tokens to another address</ActionDescription>
          </ActionButton>
          
          <ActionButton onClick={() => navigate('/receive')}>
            <Download />
            <ActionTitle>Receive</ActionTitle>
            <ActionDescription>Receive tokens to your wallet</ActionDescription>
          </ActionButton>
          
          <ActionButton onClick={() => navigate('/request')}>
            <FileText />
            <ActionTitle>Request</ActionTitle>
            <ActionDescription>Request payment from others</ActionDescription>
          </ActionButton>
        </ActionsContainer>
        
        <Tabs>
          <Tab 
            active={activeTab === 'contacts'} 
            onClick={() => setActiveTab('contacts')}
          >
            Contacts
          </Tab>
          <Tab 
            active={activeTab === 'pending'} 
            onClick={() => setActiveTab('pending')}
          >
            Pending
          </Tab>
          <Tab 
            active={activeTab === 'activity'} 
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </Tab>
        </Tabs>
        
        {activeTab === 'contacts' && (
          <ContactsList>
            {contacts.length === 0 ? (
              <ActionButton onClick={() => console.log('Add contact clicked')}>
                <Plus />
                <ActionTitle>Add New</ActionTitle>
                <ActionDescription>Add a new contact to your address book</ActionDescription>
              </ActionButton>
            ) : (
              contacts.map((contact) => (
                <ContactItem key={contact.id}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ContactIcon>{contact.name.charAt(0).toUpperCase()}</ContactIcon>
                    <ContactInfo>
                      <ContactName>{contact.name}</ContactName>
                      <ContactAddress>{formatAddress(contact.address)}</ContactAddress>
                    </ContactInfo>
                  </div>
                  <SendButton onClick={() => navigate(`/send?to=${contact.address}`)}>Send</SendButton>
                </ContactItem>
              ))
            )}
          </ContactsList>
        )}
        
        {activeTab === 'pending' && (
          <PendingList>
            {incomingRequests.length === 0 ? (
              <Card>
                <p style={{ textAlign: 'center', padding: '24px' }}>
                  No pending requests
                </p>
              </Card>
            ) : (
              incomingRequests.map((request) => (
                <PendingItem key={request.id}>
                  <PendingHeader>
                    <div>Payment Request</div>
                    <PendingAmount>{formatAmount(request.amount)}</PendingAmount>
                  </PendingHeader>
                  
                  <ActivityDetails>
                    From: {formatAddress(request.from_address)}
                  </ActivityDetails>
                  
                  {request.note && (
                    <ActivityDetails style={{ marginTop: '8px' }}>
                      Note: {request.note}
                    </ActivityDetails>
                  )}
                  
                  <PendingActions>
                    <SendButton onClick={() => navigate(`/send?to=${request.from_address}&amount=${request.amount}`)}>
                      Pay
                    </SendButton>
                  </PendingActions>
                </PendingItem>
              ))
            )}
          </PendingList>
        )}
        
        {activeTab === 'activity' && (
          <ActivityList>
            {wallet?.transactions?.length === 0 ? (
              <EmptyState>
                <p>No transaction history yet</p>
                <p style={{ fontSize: '14px', marginTop: '8px' }}>Start by sending or receiving SUP tokens</p>
              </EmptyState>
            ) : (
              wallet?.transactions?.map((tx, index) => {
                const isSent = tx.from === wallet.address;
                const txStatus = tx.status || 'confirmed';
                const displayStatus = txStatus === 'confirmed' ? 'confirmed' : 
                                    txStatus === 'pending' ? 'pending' : 'failed';
                const txType = isSent ? 'sent' : 'received';
                const formattedDate = new Date(tx.timestamp * 1000).toLocaleString();
                
                return (
                  <ActivityItem key={tx.txid || index}>
                    <ActivityIcon type={txType}>
                      {isSent ? '↑' : '↓'}
                    </ActivityIcon>
                    <ActivityInfo>
                      <ActivityTitle>
                        {isSent ? 'Sent SUP' : 'Received SUP'}
                        <ActivityStatus status={displayStatus}>
                          {displayStatus === 'confirmed' ? 'Confirmed' : 
                           displayStatus === 'pending' ? 'Pending' : 'Failed'}
                        </ActivityStatus>
                      </ActivityTitle>
                      <ActivityDetails>
                        {isSent ? `To: ${formatAddress(tx.receiver || tx.to)}` : 
                                 `From: ${formatAddress(tx.sender || tx.from)}`}
                      </ActivityDetails>
                      <ActivityDate>{formattedDate}</ActivityDate>
                    </ActivityInfo>
                    <div>
                      <ActivityAmount type={txType}>
                        {isSent ? '-' : '+'}{formatAmount(tx.amount || tx.value)}
                      </ActivityAmount>
                      <ActivityDetails style={{ textAlign: 'right', marginTop: '4px' }}>
                        {tx.blockHeight ? `Block #${tx.blockHeight}` : 'Pending'}
                      </ActivityDetails>
                    </div>
                  </ActivityItem>
                );
              })
            )}
          </ActivityList>
        )}
      </DashboardContainer>
    </DashboardLayout>
  );
};

export default Dashboard; 