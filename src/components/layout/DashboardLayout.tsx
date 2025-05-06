import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useWallet } from '../../contexts/WalletContext';
import { Settings, Copy, LogOut } from '../../utils/iconWrappers';
import { useToast } from '../../contexts/ToastContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  @media (max-width: 480px) {
    padding: 12px 16px;
  }
`;

const AccountSection = styled.div`
  display: flex;
  align-items: center;
`;

const AccountIcon = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  margin-right: 10px;
  
  @media (max-width: 480px) {
    width: 26px;
    height: 26px;
    font-size: 14px;
    margin-right: 8px;
  }
`;

const AccountName = styled.div`
  font-weight: 500;
  font-size: 16px;
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const SettingsButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const Content = styled.main`
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const StatusIndicator = styled.div<{ connected: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ connected, theme }) => 
    connected ? theme.colors.success : theme.colors.error};
  margin-right: 8px;
`;

const StatusText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-right: 12px;
  
  @media (max-width: 480px) {
    font-size: 12px;
    margin-right: 8px;
  }
`;

const Menu = styled.div`
  position: absolute;
  top: 60px;
  right: 20px;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 200px;
  overflow: hidden;
  
  @media (max-width: 480px) {
    top: 54px;
    right: 16px;
    min-width: 180px;
  }
`;

const MenuItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
  
  svg {
    margin-right: 10px;
    font-size: 18px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 14px;
    
    svg {
      font-size: 16px;
      margin-right: 8px;
    }
  }
`;

const AddressItem = styled(MenuItem)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 16px;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  }
  
  @media (max-width: 480px) {
    padding: 14px;
  }
`;

const AddressText = styled.div`
  flex: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-size: 14px;
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { wallet, disconnectWallet } = useWallet();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleCopyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      showToast('Address copied to clipboard', 'success');
      setMenuOpen(false);
    }
  };
  
  const handleLogout = () => {
    disconnectWallet();
    navigate('/');
  };
  
  // Format address for display (first 6 and last 4 chars)
  const formatAddress = (address: string): string => {
    if (!address) return '';
    if (address.length <= 13) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <Container>
      <Header>
        <AccountSection>
          <AccountIcon>A</AccountIcon>
          <AccountName>Account 1</AccountName>
        </AccountSection>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <StatusIndicator connected={true} />
          <StatusText>Connected</StatusText>
          <SettingsButton onClick={() => setMenuOpen(!menuOpen)}>
            <Settings />
          </SettingsButton>
          
          {menuOpen && (
            <Menu>
              <AddressItem onClick={handleCopyAddress}>
                <AddressText>{wallet?.address ? formatAddress(wallet.address) : 'Unknown'}</AddressText>
                <Copy />
              </AddressItem>
              <MenuItem onClick={handleLogout}>
                <LogOut />
                Disconnect
              </MenuItem>
            </Menu>
          )}
        </div>
      </Header>
      
      <Content>
        {children}
      </Content>
    </Container>
  );
};

export default DashboardLayout; 