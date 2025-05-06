import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme, GlobalStyle } from './styles/theme';

// Context Providers
import { WalletProvider } from './contexts/WalletContext';
import { AddressBookProvider } from './contexts/AddressBookContext';
import { RequestsProvider } from './contexts/RequestsContext';
import { ToastProvider } from './contexts/ToastContext';

// Pages
import Welcome from './pages/Welcome';
import CreateWallet from './pages/CreateWallet';
import ImportWallet from './pages/ImportWallet';
import BackupPhrase from './pages/BackupPhrase';
import Dashboard from './pages/Dashboard';
import Send from './pages/Send';
import Receive from './pages/Receive';
import Request from './pages/Request';

// Layout components
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <ToastProvider>
        <WalletProvider>
          <AddressBookProvider>
            <RequestsProvider>
              <Router>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Welcome />} />
                  <Route path="/create" element={<CreateWallet />} />
                  <Route path="/import" element={<ImportWallet />} />
                  <Route path="/backup-phrase" element={<BackupPhrase />} />
                  
                  {/* Protected routes */}
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/send" element={
                    <PrivateRoute>
                      <Send />
                    </PrivateRoute>
                  } />
                  <Route path="/receive" element={
                    <PrivateRoute>
                      <Receive />
                    </PrivateRoute>
                  } />
                  <Route path="/request" element={
                    <PrivateRoute>
                      <Request />
                    </PrivateRoute>
                  } />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Router>
            </RequestsProvider>
          </AddressBookProvider>
        </WalletProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
