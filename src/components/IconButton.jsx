import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1.2rem; /* Adjust as needed */
  color: ${({ theme }) => theme.iconColor};

  &:hover {
    color: ${({ theme }) => theme.iconHover};
  }

  &:disabled {
    color: ${({ theme }) => theme.iconColor}55;
    cursor: not-allowed;
  }
`;

// Example Usage: <IconButton onClick={handler} aria-label="Favorite"><StarIcon /></IconButton>
const IconButton = ({ children, onClick, disabled, 'aria-label': ariaLabel }) => {
  return (
    <Button onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {children} {/* Expects an SVG icon component or similar */}
    </Button>
  );
};

export default IconButton; 