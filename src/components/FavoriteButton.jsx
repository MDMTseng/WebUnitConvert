import React from 'react';
import styled from 'styled-components';
import IconButton from './IconButton';
// Import star icons (replace with actual icons later)
// import { StarIconFilled, StarIconOutline } from '../assets/icons';

// Placeholder icons
const StarIconFilled = () => <span>★</span>;
const StarIconOutline = () => <span>☆</span>;

// No specific theme styles needed here as it uses IconButton
const FavoriteButton = ({ isFavorite, onClick }) => {
  return (
    <IconButton
      onClick={onClick}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? <StarIconFilled /> : <StarIconOutline />}
    </IconButton>
  );
};

export default FavoriteButton; 