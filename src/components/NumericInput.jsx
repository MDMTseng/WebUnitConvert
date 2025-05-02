import React from 'react';
import { TextField, Box, IconButton, InputAdornment } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { useConversionContext } from '../contexts/useConversionContext';
import { ActionTypes } from '../contexts/ConversionContext';

const NumericInput = ({ label, value, onChange, id, placeholder = 'Enter value' }) => {
  const { dispatch } = useConversionContext();

  const handleChange = (e) => {
    const val = e.target.value;
    if (val === '' || val === '-' || /^-?\d*\.?\d*$/.test(val)) {
      dispatch({ type: ActionTypes.SET_USER_INPUT, payload: true });
      onChange(val);
    }
  };

  const handleClear = () => {
    dispatch({ type: ActionTypes.SET_USER_INPUT, payload: true });
    onChange('');
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
        InputProps={{
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton
                aria-label="clear input"
                onClick={handleClear}
                edge="end"
                size="small"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
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
