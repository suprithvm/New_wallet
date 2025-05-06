import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import QRCode from 'react-qr-code';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, Button } from '../components/ui';
import { useWallet } from '../contexts/WalletContext';
import { ArrowLeft, Copy } from '../utils/iconWrappers';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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

const QRContainer = styled(Card)`
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const QRTitle = styled.h3`
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 16px;
`;

const QRDescription = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 24px;
  text-align: center;
`;

const QRCodeWrapper = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
`;

const AddressContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: 8px;
  padding: 12px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const Address = styled.div`
  font-size: 14px;
  font-family: monospace;
  color: ${({ theme }) => theme.colors.text};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
  font-size: 16px;
`;

const CopyButtonText = styled.span`
  margin-left: 4px;
  font-size: 14px;
`;

const Receive: React.FC = () => {
  const navigate = useNavigate();
  const { wallet } = useWallet();
  
  // Format address for display (first 6 and last 4 chars)
  const formatAddress = (address: string): string => {
    if (!address) return '';
    if (address.length <= 13) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      // You might want to show a toast notification here
    }
  };
  
  return (
    <DashboardLayout>
      <Container>
        <Header>
          <BackButton onClick={() => navigate('/dashboard')}>
            <ArrowLeft />
          </BackButton>
          <Title>Receive Supereum</Title>
        </Header>
        
        <QRContainer>
          <QRTitle>Scan QR code to get address</QRTitle>
          <QRDescription>
            Scan this QR code or share your address to receive Supereum tokens.
          </QRDescription>
          
          {wallet?.address && (
            <QRCodeWrapper>
              <QRCode 
                value={wallet.address} 
                size={200}
                level="H"
                fgColor="#000000"
                bgColor="#FFFFFF"
              />
            </QRCodeWrapper>
          )}
          
          <div style={{ width: '100%' }}>
            <h4 style={{ marginBottom: '8px' }}>Wallet Address</h4>
            <AddressContainer>
              <Address>{wallet?.address || 'No wallet address'}</Address>
              <CopyButton onClick={copyAddress}>
                <Copy />
                <CopyButtonText>Copy</CopyButtonText>
              </CopyButton>
            </AddressContainer>
          </div>
          
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard')}
            fullWidth
          >
            Back to Dashboard
          </Button>
        </QRContainer>
      </Container>
    </DashboardLayout>
  );
};

export default Receive; 