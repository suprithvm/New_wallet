import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useWallet } from '../contexts/WalletContext';
import { Button } from '../components/ui';
import { FaShieldAlt, FaExchangeAlt, FaBolt } from 'react-icons/fa';
import { FiPlusCircle, FiDownload } from 'react-icons/fi';
import { PlusCircle, Download } from '../utils/iconWrappers';
import { ExchangeAlt, ShieldAlt, Bolt } from '../utils/iconWrappers';

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  text-align: center;
  background: linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
`;

const Logo = styled.div`
  margin-bottom: 30px;
  width: 100px;
  height: 100px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  color: white;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 10px;
  color: white;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 40px;
  max-width: 600px;
`;

const FeaturesContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 50px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
`;

const Feature = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 150px;
`;

const FeatureIcon = styled.div`
  font-size: 24px;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: rgba(138, 43, 226, 0.1);
`;

const FeatureTitle = styled.h3`
  font-size: 16px;
  margin-bottom: 5px;
  font-weight: 500;
`;

const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 500px;
`;

const ActionButton = styled.div`
  padding: 20px;
  background-color: rgba(30, 30, 30, 0.7);
  border-radius: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
`;

const ActionIconContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  width: 50px;
  height: 50px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  color: white;
  font-size: 24px;
`;

const ActionContent = styled.div`
  flex: 1;
  text-align: left;
`;

const ActionTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 5px;
  font-weight: 500;
`;

const ActionDescription = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ActionArrow = styled.div`
  font-size: 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Footer = styled.div`
  margin-top: 40px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { wallet } = useWallet();
  
  // If user already has a wallet, redirect to dashboard
  useEffect(() => {
    if (wallet) {
      navigate('/dashboard');
    }
  }, [wallet, navigate]);
  
  return (
    <WelcomeContainer>
      <Logo>
        <ExchangeAlt />
      </Logo>
      <Title>Welcome to CryptoWallet</Title>
      <Subtitle>The next generation crypto wallet for the decentralized web</Subtitle>
      
      <FeaturesContainer>
        <Feature>
          <FeatureIcon>
            <ShieldAlt />
          </FeatureIcon>
          <FeatureTitle>Secure Storage</FeatureTitle>
        </Feature>
        <Feature>
          <FeatureIcon>
            <ExchangeAlt />
          </FeatureIcon>
          <FeatureTitle>Multi-Chain</FeatureTitle>
        </Feature>
        <Feature>
          <FeatureIcon>
            <Bolt />
          </FeatureIcon>
          <FeatureTitle>Fast Transactions</FeatureTitle>
        </Feature>
      </FeaturesContainer>
      
      <ActionContainer>
        <ActionButton onClick={() => navigate('/create')}>
          <ActionIconContainer>
            <PlusCircle />
          </ActionIconContainer>
          <ActionContent>
            <ActionTitle>Create a New Wallet</ActionTitle>
            <ActionDescription>Generate a new wallet with a secure recovery phrase</ActionDescription>
          </ActionContent>
          <ActionArrow>→</ActionArrow>
        </ActionButton>
        
        <ActionButton onClick={() => navigate('/import')}>
          <ActionIconContainer>
            <Download />
          </ActionIconContainer>
          <ActionContent>
            <ActionTitle>Import Existing Wallet</ActionTitle>
            <ActionDescription>Restore your wallet using a recovery phrase</ActionDescription>
          </ActionContent>
          <ActionArrow>→</ActionArrow>
        </ActionButton>
      </ActionContainer>
      
      <Footer>
        End-to-end encrypted · Secure storage
      </Footer>
    </WelcomeContainer>
  );
};

export default Welcome; 