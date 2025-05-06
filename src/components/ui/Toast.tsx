import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
`;

const ToastContainer = styled.div<{ type: string; isClosing: boolean }>`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${({ type, theme }) => 
    type === 'success' ? theme.colors.success : 
    type === 'error' ? theme.colors.error : 
    theme.colors.primary};
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  min-width: 200px;
  max-width: 80vw;
  animation: ${({ isClosing }) => isClosing ? fadeOut : fadeIn} 0.3s ease-in-out;
  
  @media (max-width: 480px) {
    width: 90%;
    padding: 10px 16px;
    font-size: 14px;
  }
`;

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  onClose, 
  duration = 3000 
}) => {
  const [isClosing, setIsClosing] = React.useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      
      // Add a small delay before removing the toast to allow animation to complete
      setTimeout(() => {
        onClose();
      }, 300);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  return (
    <ToastContainer type={type} isClosing={isClosing}>
      {message}
    </ToastContainer>
  );
};

export default Toast; 