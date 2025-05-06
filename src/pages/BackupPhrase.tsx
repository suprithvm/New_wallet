import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from '../components/ui';
import { ArrowLeft, Copy, ShieldAlt, AlertTriangle } from '../utils/iconWrappers';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  width: 100%;
  box-sizing: border-box;
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
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  z-index: 10;
  margin: 60px auto 40px;
  position: relative;
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

const WarningContainer = styled.div`
  background-color: rgba(255, 152, 0, 0.1);
  border: 1px solid #ff9800;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  margin-top: 20px;
`;

const WarningTitle = styled.div`
  display: flex;
  align-items: center;
  color: #ff9800;
  font-weight: 600;
  margin-bottom: 8px;
  gap: 8px;
`;

const WarningList = styled.ul`
  margin: 0;
  padding-left: 20px;
  
  li {
    margin-bottom: 6px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const WordsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
`;

const WordItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  font-family: monospace;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text || '#fff'};
  
  &::before {
    content: attr(data-index);
    margin-right: 8px;
    color: ${({ theme }) => theme.colors.textSecondary || '#aaa'};
    min-width: 24px;
    text-align: right;
  }
`;

const CopyButton = styled(Button)`
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-right: 8px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 20px;
`;

interface BackupPhraseProps {
  mnemonic?: string;
}

const BackupPhrase: React.FC<BackupPhraseProps> = ({ mnemonic }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    try {
      // Get the mnemonic from local storage if not provided as a prop
      if (!mnemonic) {
        console.log('No mnemonic provided as prop, checking localStorage');
        const walletData = localStorage.getItem('walletData');
        
        if (walletData) {
          console.log('Found walletData in localStorage');
          
          try {
            const parsed = JSON.parse(walletData);
            console.log('Parsed wallet data successfully', parsed);
            
            if (parsed.mnemonic) {
              console.log('Found mnemonic in walletData, setting words');
              const wordArray = parsed.mnemonic.split(' ');
              console.log('Word array length:', wordArray.length);
              setWords(wordArray);
              return;
            } else {
              console.error('No mnemonic found in walletData:', parsed);
              setError('No recovery phrase found in wallet data');
            }
          } catch (e) {
            console.error('Error parsing wallet data:', e);
            setError('Error reading wallet data');
          }
        } else {
          console.log('No walletData found in localStorage');
          setError('No wallet data found');
        }
        
        // If no mnemonic is found, navigate back to create wallet
        console.log('No mnemonic found, navigating back to create wallet');
        setTimeout(() => navigate('/create'), 2000);
      } else {
        console.log('Mnemonic provided as prop, setting words');
        setWords(mnemonic.split(' '));
      }
    } catch (e) {
      console.error('Unexpected error in BackupPhrase component:', e);
      setError('Unexpected error loading recovery phrase');
    }
  }, [mnemonic, navigate]);
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(words.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleBackedUp = () => {
    // Set a flag in localStorage that the user has confirmed backing up their phrase
    localStorage.setItem('backup_phrase_confirmed', 'true');
    navigate('/dashboard');
  };
  
  return (
    <Container>
      <BackButton onClick={() => navigate('/create')}>
        <ArrowLeft />
      </BackButton>
      
      <FormContainer>
        <Title>Backup Recovery Phrase</Title>
        <Subtitle>Write down these 12 words and keep them in a safe place</Subtitle>
        
        {error && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: 'rgba(244, 67, 54, 0.1)', 
            color: '#F44336',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p>{error}</p>
            <p style={{ marginTop: '10px', fontSize: '14px' }}>
              Redirecting back to wallet creation...
            </p>
          </div>
        )}
        
        {words.length > 0 ? (
          <>
            <WordsContainer>
              {words.map((word, index) => (
                <WordItem key={index} data-index={`${index + 1}.`}>
                  {word}
                </WordItem>
              ))}
            </WordsContainer>
            
            <CopyButton 
              fullWidth 
              variant="secondary" 
              size="medium"
              onClick={handleCopyToClipboard}
            >
              <Copy /> {copied ? 'Copied!' : 'Copy to clipboard'}
            </CopyButton>
            
            <WarningContainer>
              <WarningTitle>
                <AlertTriangle /> Important:
              </WarningTitle>
              <WarningList>
                <li>Never share your recovery phrase with anyone</li>
                <li>Store it in a secure location</li>
                <li>If you lose it, you'll lose access to your wallet</li>
              </WarningList>
            </WarningContainer>
            
            <ButtonGroup>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => navigate('/create')}
              >
                Back
              </Button>
              <Button 
                fullWidth
                onClick={handleBackedUp}
              >
                I've Backed It Up
              </Button>
            </ButtonGroup>
          </>
        ) : !error && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '24px', marginBottom: '20px' }}>Loading recovery phrase...</div>
          </div>
        )}
      </FormContainer>
    </Container>
  );
};

export default BackupPhrase; 