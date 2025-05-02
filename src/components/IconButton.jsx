import React from 'react';
import { IconButton as MuiIconButton } from '@mui/material';

// Material UI IconButton with sensible defaults
const IconButton = ({ children, onClick, disabled, 'aria-label': ariaLabel, color = "primary", size = "medium", ...props }) => {
  return (
    <MuiIconButton 
      onClick={onClick} 
      disabled={disabled} 
      aria-label={ariaLabel}
      color={color}
      size={size}
      {...props}
    >
      {children}
    </MuiIconButton>
  );
};

export default IconButton; 