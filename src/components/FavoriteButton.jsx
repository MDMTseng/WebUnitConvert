import React from 'react';
import IconButton from './IconButton';
import { Star, StarOutline } from '@mui/icons-material';

const FavoriteButton = ({ isFavorite, onClick, disabled = false }) => {
  return (
    <IconButton
      onClick={onClick}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      color="primary"
      disabled={disabled}
    >
      {isFavorite ? <Star /> : <StarOutline />}
    </IconButton>
  );
};

export default FavoriteButton; 