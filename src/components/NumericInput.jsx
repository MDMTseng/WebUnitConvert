import React from 'react';
import { TextField, Box } from '@mui/material';

const NumericInput = ({ label, value, onChange, id, placeholder = 'Enter value' }) => {
  const handleChange = (e) => {
    const val = e.target.value;
    if (val === '' || val === '-' || /^-?\d*\.?\d*$/.test(val)) {
      onChange(val);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        fullWidth
        variant="outlined"
        label={label}
        id={id}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        inputProps={{
          inputMode: 'decimal',
          pattern: '^-?\\d*\\.?\\d*$',
          sx: {
            // Remove spinner arrows for number inputs
            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
              '-webkit-appearance': 'none',
              margin: 0,
            },
            '&[type=number]': {
              '-moz-appearance': 'textfield',
            },
          }
        }}
      />
    </Box>
  );
};

export default NumericInput;
