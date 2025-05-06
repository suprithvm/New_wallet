import React, { useState } from 'react';
import styled from 'styled-components';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const InputContainer = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  margin-bottom: 16px;
`;

const InputLabel = styled.label`
  font-size: 14px;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input<{ hasIcon: boolean; iconPosition?: string; hasError?: boolean }>`
  width: 100%;
  padding: ${({ hasIcon, iconPosition }) =>
    hasIcon ? (iconPosition === 'left' ? '12px 12px 12px 40px' : '12px 40px 12px 12px') : '12px'};
  font-size: 16px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.border)};
  color: ${({ theme }) => theme.colors.text};
  transition: ${({ theme }) => theme.transitions.default};

  &:focus {
    outline: none;
    border-color: ${({ theme, hasError }) => (hasError ? theme.colors.error : theme.colors.primary)};
    box-shadow: 0 0 0 2px ${({ theme, hasError }) => (hasError ? `${theme.colors.error}33` : `${theme.colors.primary}33`)};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.7;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const IconContainer = styled.div<{ position: string }>`
  position: absolute;
  ${({ position }) => (position === 'left' ? 'left: 12px;' : 'right: 12px;')};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ErrorMessage = styled.p`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.error};
  font-size: 12px;
`;

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  ...rest
}) => {
  return (
    <InputContainer fullWidth={fullWidth}>
      {label && <InputLabel>{label}</InputLabel>}
      <InputWrapper>
        {icon && <IconContainer position={iconPosition}>{icon}</IconContainer>}
        <StyledInput
          hasIcon={!!icon}
          iconPosition={iconPosition}
          hasError={!!error}
          {...rest}
        />
      </InputWrapper>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  );
};

export default Input; 