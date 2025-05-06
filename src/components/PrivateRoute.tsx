import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { useToast } from '../contexts/ToastContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { wallet, loading } = useWallet();
  const { showToast } = useToast();
  const location = useLocation();
  
  // Check if backup phrase has been shown
  useEffect(() => {
    // Only run this check if we have a wallet and are not already on the backup phrase page
    if (wallet && location.pathname !== '/backup-phrase') {
      // Get wallet data from localStorage
      const walletData = localStorage.getItem('walletData');
      if (walletData) {
        const parsed = JSON.parse(walletData);
        // Check if the user has confirmed seeing the backup phrase
        const hasSeenBackupPhrase = localStorage.getItem('backup_phrase_confirmed');
        
        if (parsed.mnemonic && !hasSeenBackupPhrase) {
          showToast('Please back up your recovery phrase first', 'info');
          // We'll redirect to backup phrase in the return statement
        }
      }
    }
  }, [wallet, location.pathname, showToast]);
  
  // If still loading, show nothing (or could add a loading spinner)
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // If not authenticated (no wallet), redirect to welcome page
  if (!wallet) {
    return <Navigate to="/" replace />;
  }
  
  // Check if backup phrase has been seen and confirmed
  const hasSeenBackupPhrase = localStorage.getItem('backup_phrase_confirmed');
  const walletData = localStorage.getItem('walletData');
  
  // If user has a wallet with mnemonic but hasn't confirmed seeing the backup phrase
  if (walletData && !hasSeenBackupPhrase && location.pathname !== '/backup-phrase') {
    const parsed = JSON.parse(walletData);
    if (parsed.mnemonic) {
      return <Navigate to="/backup-phrase" replace />;
    }
  }
  
  // Otherwise, render the protected component
  return <>{children}</>;
};

export default PrivateRoute; 