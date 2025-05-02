import React from 'react';
import styled from 'styled-components';
import NumericInput from './NumericInput';

const ResultWrapper = styled.div`
  margin-top: 1rem;
  /* No background/padding needed if input handles it */
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.errorText};
  font-weight: bold;
  margin: 0;
  padding: 0.75rem 0.5rem;
`;

const PlaceholderText = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.text}88;
    padding: 0.75rem 0.5rem;
`;

const ConversionResult = ({ result, error, onOutputChange, readOnly = false }) => {
  const handleChange = (newValue) => {
    if (onOutputChange) {
      onOutputChange(newValue);
    }
  };

  return (
    <ResultWrapper>
      {error ? (
        <ErrorText>Error: {error}</ErrorText>
      ) : (
        <NumericInput
          label="Result"
          id="output-value"
          value={result ?? ''}
          onChange={handleChange}
          placeholder="Conversion result"
          readOnly={readOnly}
        />
      )}
    </ResultWrapper>
  );
};

export default ConversionResult; 