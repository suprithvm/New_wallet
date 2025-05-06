import React from 'react';
import styled, { css } from 'styled-components';

export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const StyledButton = styled.button<ButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  font-weight: 500;
  transition: ${({ theme }) => theme.transitions.default};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  
  ${({ variant, theme }) =>
    variant === 'primary' &&
    css`
      background-color: ${theme.colors.primary};
      color: ${theme.colors.buttonText};
      border: none;
      
      &:hover:not(:disabled) {
        background-color: ${theme.colors.secondary};
      }
      
      &:disabled {
        background-color: ${theme.colors.primary}80;
        color: ${theme.colors.buttonText}80;
      }
    `}
  
  ${({ variant, theme }) =>
    variant === 'secondary' &&
    css`
          background-color: ${theme.colors.secondary};
      color: ${theme.colors.buttonText};
      border: none;
          
      &:hover:not(:disabled) {
        background-color: ${theme.colors.primary};
          }
          
      &:disabled {
        background-color: ${theme.colors.secondary}80;
        color: ${theme.colors.buttonText}80;
          }
    `}
  
  ${({ variant, theme }) =>
    variant === 'outlined' &&
    css`
          background-color: transparent;
          color: ${theme.colors.primary};
      border: 1px solid ${theme.colors.primary};
          
      &:hover:not(:disabled) {
        background-color: ${theme.colors.primary}10;
          }
          
      &:disabled {
        color: ${theme.colors.primary}80;
        border-color: ${theme.colors.primary}80;
          }
    `}
  
  ${({ variant, theme }) =>
    variant === 'text' &&
    css`
          background-color: transparent;
          color: ${theme.colors.primary};
      border: none;
          
      &:hover:not(:disabled) {
        background-color: ${theme.colors.primary}10;
          }
          
      &:disabled {
        color: ${theme.colors.primary}80;
          }
    `}
  
  ${({ size }) =>
    size === 'small' &&
    css`
      padding: 8px 16px;
      font-size: 14px;
    `}
  
  ${({ size }) =>
    size === 'medium' &&
    css`
      padding: 10px 20px;
      font-size: 16px;
    `}
  
  ${({ size }) =>
    size === 'large' &&
    css`
      padding: 12px 24px;
      font-size: 18px;
    `}
  
  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}
    
  ${({ iconPosition }) =>
    iconPosition === 'right' &&
    css`
      flex-direction: row-reverse;
    `}
`;

const Button: React.FC<ButtonProps> = ({ 
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      icon={icon}
      iconPosition={iconPosition}
      {...props}
    >
      {icon && icon}
      {children}
    </StyledButton>
  );
};

export default Button; 