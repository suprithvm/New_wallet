import React from 'react';
import styled from 'styled-components';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  padding?: string;
  variant?: 'default' | 'outlined';
  onClick?: () => void;
  className?: string;
}

const CardContainer = styled.div<{ padding?: string; variant?: string; clickable?: boolean }>`
  background-color: ${({ theme, variant }) => 
    variant === 'outlined' ? 'transparent' : theme.colors.backgroundSecondary};
  border-radius: 12px;
  padding: ${({ padding }) => padding || '20px'};
  border: 1px solid ${({ theme, variant }) => 
    variant === 'outlined' ? theme.colors.border : 'transparent'};
  box-shadow: ${({ theme, variant }) => 
    variant === 'outlined' ? 'none' : theme.shadows.medium};
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  transition: ${({ theme }) => theme.transitions.default};
  
  &:hover {
    transform: ${({ clickable }) => (clickable ? 'translateY(-2px)' : 'none')};
    box-shadow: ${({ theme, clickable, variant }) => 
      clickable && variant !== 'outlined' ? theme.shadows.large : variant === 'outlined' ? 'none' : theme.shadows.medium};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const CardIcon = styled.div`
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

export const Card: React.FC<CardProps> = ({
  children,
  title,
  icon,
  padding,
  variant = 'default',
  onClick,
  className,
}) => {
  return (
    <CardContainer 
      padding={padding}
      variant={variant}
      clickable={!!onClick}
      onClick={onClick}
      className={className}
    >
      {(title || icon) && (
        <CardHeader>
          {icon && <CardIcon>{icon}</CardIcon>}
          {title && <CardTitle>{title}</CardTitle>}
        </CardHeader>
      )}
      {children}
    </CardContainer>
  );
};

export default Card; 