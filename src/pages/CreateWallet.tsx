import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useWallet } from '../contexts/WalletContext';
import { Button, Input } from '../components/ui';
import { ArrowLeft, EyeOff, Eye, Lock, Shield } from '../utils/iconWrappers';

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

const PasswordStrengthContainer = styled.div`
  margin-top: -10px;
  margin-bottom: 15px;
`;

const PasswordLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 5px;
`;

const PasswordStrength = styled.div`
  color: ${({ color }) => color || '#B3B3B3'};
  font-weight: 500;
`;

const StrengthBar = styled.div`
  display: flex;
  gap: 4px;
  height: 4px;
  width: 100%;
`;

const StrengthSegment = styled.div<{ active: boolean; color: string }>`
  flex: 1;
  height: 100%;
  background-color: ${({ active, color }) => (active ? color : '#333')};
  border-radius: 2px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  gap: 30px;
`;

const FooterItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  gap: 8px;
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 20px;
  
  a {
    color: ${({ theme }) => theme.colors.primary};
    margin-left: 5px;
    margin-right: 5px;
  }
`;

interface PasswordStrengthResult {
  score: number;
  label: string;
  color: string;
}

const checkPasswordStrength = (password: string): PasswordStrengthResult => {
  // Simple password strength check (in a real app, use a more sophisticated algorithm)
  if (!password) {
    return { score: 0, label: '', color: '#B3B3B3' };
  }
  
  let score = 0;
  
  // Length check
  if (password.length > 8) score += 1;
  if (password.length > 12) score += 1;
  
  // Complexity checks
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  // Score capping
  score = Math.min(score, 4);
  
  // Map score to label and color
  const strengthMap = [
    { label: 'Weak', color: '#F44336' },
    { label: 'Fair', color: '#FFC107' },
    { label: 'Good', color: '#2196F3' },
    { label: 'Strong', color: '#4CAF50' },
    { label: 'Very Strong', color: '#4CAF50' }
  ];
  
  return { 
    score, 
    label: strengthMap[score].label, 
    color: strengthMap[score].color 
  };
};

const CreateWallet: React.FC = () => {
  const navigate = useNavigate();
  const { wallet, createWallet, loading, error } = useWallet();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult>({ score: 0, label: '', color: '#B3B3B3' });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Redirect to dashboard if already have a wallet
  useEffect(() => {
    if (wallet) {
      // Instead of redirecting to dashboard, check if backup phrase has been confirmed
      const hasSeenBackupPhrase = localStorage.getItem('backup_phrase_confirmed');
      
      if (hasSeenBackupPhrase) {
        // If backup phrase is confirmed, go to dashboard
        navigate('/dashboard');
      } else {
        // Otherwise, go to backup phrase page
        navigate('/backup-phrase');
      }
    }
  }, [wallet, navigate]);
  
  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password));
  }, [password]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Validation
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (passwordStrength.score < 2) {
      setFormError('Please use a stronger password');
      return;
    }
    
    if (!termsAccepted) {
      setFormError('You must agree to the terms of service');
      return;
    }
    
    try {
      console.log('Creating wallet with password:', password);
      
      // Create wallet using the RPC API
      const newWallet = await createWallet(password);
      console.log('Wallet created successfully:', newWallet.address);
      
      // Reset the backup phrase confirmation flag
      localStorage.removeItem('backup_phrase_confirmed');
      
      // Navigate to backup phrase page using the correct route
      navigate('/backup-phrase');
    } catch (err: any) {
      console.error('Error creating wallet:', err);
      setFormError(err.message || 'Failed to create wallet');
    }
  };
  
  return (
    <Container>
      <BackButton onClick={() => navigate('/')}>
        <ArrowLeft />
      </BackButton>
      
      <FormContainer>
        <Title>Create New Wallet</Title>
        <Subtitle>Create a password to secure your wallet</Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <div>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a strong password"
              icon={showPassword ? <EyeOff onClick={() => setShowPassword(false)} /> : <Eye onClick={() => setShowPassword(true)} />}
              iconPosition="right"
              fullWidth
            />
            
            <PasswordStrengthContainer>
              <PasswordLabel>
                <span>Password Strength:</span> 
                <PasswordStrength color={passwordStrength.color}>
                  {passwordStrength.label}
                </PasswordStrength>
              </PasswordLabel>
              
              <StrengthBar>
                <StrengthSegment active={passwordStrength.score >= 1} color={passwordStrength.color} />
                <StrengthSegment active={passwordStrength.score >= 2} color={passwordStrength.color} />
                <StrengthSegment active={passwordStrength.score >= 3} color={passwordStrength.color} />
                <StrengthSegment active={passwordStrength.score >= 4} color={passwordStrength.color} />
              </StrengthBar>
            </PasswordStrengthContainer>
          </div>
          
          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            icon={<Lock />}
            fullWidth
          />
          
          <CheckboxLabel>
            <Checkbox 
              type="checkbox" 
              checked={termsAccepted} 
              onChange={() => setTermsAccepted(!termsAccepted)}
            />
            I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
          </CheckboxLabel>
          
          {(formError || error) && (
            <div style={{ color: '#F44336', fontSize: '14px', marginBottom: '10px' }}>
              {formError || error}
            </div>
          )}
          
          <Button 
            type="submit" 
            fullWidth 
            size="large"
            disabled={loading || !password || !confirmPassword}
          >
            {loading ? 'Creating Wallet...' : 'Create Wallet'}
          </Button>
        </Form>
        
        <Footer>
          <FooterItem>
            <Lock /> Strong Encryption
          </FooterItem>
          <FooterItem>
            <Shield /> Data Protection
          </FooterItem>
        </Footer>
      </FormContainer>
    </Container>
  );
};

export default CreateWallet; 