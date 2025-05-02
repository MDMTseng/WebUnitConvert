import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import NumericInput from './NumericInput';

const ConversionResult = ({ result, error, onOutputChange, readOnly = false }) => {
  const handleChange = (newValue) => {
    if (onOutputChange) {
      onOutputChange(newValue);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
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
    </Box>
  );
};

export default ConversionResult; 