import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useWallet } from '../contexts/WalletContext';
import { Button, Input } from '../components/ui';
import { ArrowLeft, Eye, EyeOff, AlertTriangle } from '../utils/iconWrappers';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FormContainer = styled.div`
  background-color: #1a1a1a;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h1`
  text-align: center;
  font-size: 24px;
  margin-bottom: 10px;
  font-weight: 600;
`;

const Subtitle = styled.p`
  text-align: center;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 30px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 12px;
  background-color: ${({ active, theme }) => 
    active ? theme.colors.backgroundSecondary : 'transparent'};
  border: none;
  color: ${({ active, theme }) => 
    active ? theme.colors.text : theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    background-color: ${({ active, theme }) => 
      active ? theme.colors.backgroundSecondary : 'rgba(30, 30, 30, 0.5)'};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text};
  font-family: inherit;
  font-size: 16px;
  resize: none;
  
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

const HelperText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 5px;
`;

const WarningBox = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: rgba(255, 193, 7, 0.1);
  border-radius: 8px;
  margin-bottom: 20px;
  
  svg {
    color: ${({ theme }) => theme.colors.warning};
    font-size: 20px;
  }
`;

const WarningText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.warning};
`;

const ImportWallet: React.FC = () => {
  const navigate = useNavigate();
  const { wallet, importWallet, loading, error } = useWallet();
  
  const [activeTab, setActiveTab] = useState<'recoveryPhrase' | 'privateKey'>('recoveryPhrase');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Redirect to dashboard if already have a wallet
  useEffect(() => {
    if (wallet) {
      navigate('/dashboard');
    }
  }, [wallet, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    try {
      if (activeTab === 'recoveryPhrase') {
        // Validate recovery phrase
        if (!recoveryPhrase.trim()) {
          setFormError('Recovery phrase is required');
          return;
        }
        
        const words = recoveryPhrase.trim().split(/\s+/);
        if (words.length !== 12 && words.length !== 24) {
          setFormError('Recovery phrase must be 12 or 24 words');
          return;
        }
        
        await importWallet(recoveryPhrase.trim());
      } else {
        // Validate private key
        if (!privateKey.trim()) {
          setFormError('Private key is required');
          return;
        }
        
        // In a real app, we'd call a different import method for private keys
        // For now, we're just using the same import method
        await importWallet(privateKey.trim());
      }
      
      navigate('/dashboard');
    } catch (err: any) {
      setFormError(err.message || 'Failed to import wallet');
    }
  };
  
  return (
    <Container>
      <BackButton onClick={() => navigate('/')}>
        <ArrowLeft />
      </BackButton>
      
      <FormContainer>
        <Title>Import Your Wallet</Title>
        <Subtitle>Restore your wallet using a recovery phrase or private key</Subtitle>
        
        <TabContainer>
          <Tab 
            active={activeTab === 'recoveryPhrase'} 
            onClick={() => setActiveTab('recoveryPhrase')}
          >
            Recovery Phrase
          </Tab>
          <Tab 
            active={activeTab === 'privateKey'} 
            onClick={() => setActiveTab('privateKey')}
          >
            Private Key
          </Tab>
        </TabContainer>
        
        <WarningBox>
          <AlertTriangle />
          <WarningText>
            Never share your recovery phrase with anyone. Anyone with this phrase can take control of your wallet.
          </WarningText>
        </WarningBox>
        
        <Form onSubmit={handleSubmit}>
          {activeTab === 'recoveryPhrase' ? (
            <>
              <div>
                <TextArea
                  value={recoveryPhrase}
                  onChange={(e) => setRecoveryPhrase(e.target.value)}
                  placeholder="Enter your 12 or 24-word recovery phrase"
                />
                <HelperText>Typically 12 (or 24) words separated by single spaces</HelperText>
              </div>
            </>
          ) : (
            <>
              <Input
                label="Private Key"
                type={showPrivateKey ? 'text' : 'password'}
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter your private key"
                fullWidth
                icon={showPrivateKey ? <EyeOff onClick={() => setShowPrivateKey(false)} /> : <Eye onClick={() => setShowPrivateKey(true)} />}
                iconPosition="right"
              />
            </>
          )}
          
          {(formError || error) && (
            <div style={{ color: '#F44336', fontSize: '14px', marginBottom: '10px' }}>
              {formError || error}
            </div>
          )}
          
          <Button 
            type="submit" 
            fullWidth 
            size="large"
            disabled={loading}
          >
            {loading ? 'Importing...' : 'Import Wallet'}
          </Button>
        </Form>
      </FormContainer>
    </Container>
  );
};

export default ImportWallet; 