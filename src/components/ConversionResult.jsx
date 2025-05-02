import React from 'react';
import styled from 'styled-components';

const ResultWrapper = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.resultBg};
  border-radius: 4px;
  min-height: 3em; /* Ensure space even when empty */
  word-wrap: break-word; /* Prevent long numbers from overflowing */
`;

const ResultText = styled.p`
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.errorText};
  font-weight: bold;
  margin: 0;
`;

const PlaceholderText = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text}88;
`;

const ConversionResult = ({ result, error }) => {
  return (
    <ResultWrapper>
      {error ? (
        <ErrorText>Error: {error}</ErrorText>
      ) : result !== null && result !== undefined ? (
        <ResultText>{result}</ResultText>
      ) : (
        <PlaceholderText>Result will appear here</PlaceholderText>
      )}
    </ResultWrapper>
  );
};

export default ConversionResult; 