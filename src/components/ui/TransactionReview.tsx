import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from './index';
import { Check, X, ChevronDown, ChevronUp } from '../../utils/iconWrappers';

const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 16px;
  text-align: center;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const Value = styled.div`
  font-weight: 500;
  text-align: right;
  font-size: 14px;
  word-break: break-all;
`;

const Total = styled(InfoRow)`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const TotalLabel = styled(Label)`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const TotalValue = styled(Value)`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const CancelButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const UtxoSection = styled.div`
  margin-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 16px;
`;

const UtxoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 8px 4px;
`;

const UtxoList = styled.div`
  margin-top: 12px;
  max-height: 200px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
`;

const UtxoItem = styled.div`
  padding: 10px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 13px;
  
  &:last-child {
    border-bottom: none;
  }
`;

const UtxoDetails = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const TxId = styled.div`
  font-family: monospace;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface Utxo {
  txid: string;
  vout: number;
  amount: number;
  owner: string;
  spent: boolean;
  block_height: number;
  timestamp: number;
  script_pub_key: string;
}

interface TransactionReviewProps {
  from: string;
  to: string;
  amount: number;
  gasPrice: number;
  gasLimit: number;
  fee: number;
  totalAmount: number;
  utxos?: Utxo[];
  onConfirm: () => void;
  onCancel: () => void;
}

const TransactionReview: React.FC<TransactionReviewProps> = ({
  from,
  to,
  amount,
  gasPrice,
  gasLimit,
  fee,
  totalAmount,
  utxos = [],
  onConfirm,
  onCancel
}) => {
  const [showUtxos, setShowUtxos] = useState(false);

  // Format address for display (first 8 and last 8 chars)
  const formatAddress = (address: string): string => {
    if (!address) return '';
    if (address.length <= 20) return address;
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <Container>
      <Title>Review Transaction</Title>
      
      <InfoRow>
        <Label>From</Label>
        <Value>{formatAddress(from)}</Value>
      </InfoRow>
      
      <InfoRow>
        <Label>To</Label>
        <Value>{formatAddress(to)}</Value>
      </InfoRow>
      
      <InfoRow>
        <Label>Amount</Label>
        <Value>{amount} SUP</Value>
      </InfoRow>
      
      <InfoRow>
        <Label>Gas Price</Label>
        <Value>{gasPrice} GWEI</Value>
      </InfoRow>
      
      <InfoRow>
        <Label>Gas Limit</Label>
        <Value>{gasLimit}</Value>
      </InfoRow>
      
      <InfoRow>
        <Label>Network Fee</Label>
        <Value>{fee} SUP</Value>
      </InfoRow>
      
      <Total>
        <TotalLabel>Total Amount</TotalLabel>
        <TotalValue>{totalAmount} SUP</TotalValue>
      </Total>
      
      {utxos.length > 0 && (
        <UtxoSection>
          <UtxoHeader onClick={() => setShowUtxos(!showUtxos)}>
            <Label>Transaction Inputs ({utxos.length})</Label>
            {showUtxos ? <ChevronUp /> : <ChevronDown />}
          </UtxoHeader>
          
          {showUtxos && (
            <UtxoList>
              {utxos.map((utxo, index) => (
                <UtxoItem key={`${utxo.txid}-${utxo.vout}`}>
                  <UtxoDetails>
                    <Label>Amount:</Label>
                    <Value>{utxo.amount} SUP</Value>
                  </UtxoDetails>
                  <UtxoDetails>
                    <Label>Block:</Label>
                    <Value>{utxo.block_height}</Value>
                  </UtxoDetails>
                  <UtxoDetails>
                    <Label>Date:</Label>
                    <Value>{formatTimestamp(utxo.timestamp)}</Value>
                  </UtxoDetails>
                  <TxId>TXID: {utxo.txid}</TxId>
                </UtxoItem>
              ))}
            </UtxoList>
          )}
        </UtxoSection>
      )}
      
      <ButtonGroup>
        <CancelButton 
          fullWidth 
          onClick={onCancel}
        >
          <X style={{ marginRight: '8px' }} /> Cancel
        </CancelButton>
        <Button 
          fullWidth 
          onClick={onConfirm}
        >
          <Check style={{ marginRight: '8px' }} /> Confirm
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default TransactionReview; 