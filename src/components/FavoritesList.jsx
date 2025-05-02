import React from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  Paper,
  IconButton as MuiIconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useConversionContext } from '../contexts/useConversionContext';
import { ActionTypes } from '../contexts/ConversionContext';

// Function to find unit details (Simplified)
const getUnitDetails = (unitSymbol, categories) => {
  for (const categoryKey in categories) {
    if (categories[categoryKey]?.units?.[unitSymbol]) {
      const unitData = categories[categoryKey].units[unitSymbol];
      return { name: unitData.name, name_zh: unitData.name_zh, symbol: unitSymbol };
    }
  }
  return { name: unitSymbol, symbol: unitSymbol }; // Fallback
};

const FavoritesList = () => {
  const { state, dispatch } = useConversionContext();
  const { favorites, categories } = state;

  const getCategoryName = (catId) => {
    return categories[catId]?.units[categories[catId]?.baseUnit]?.name || catId;
    // Simplified name lookup - assumes base unit name represents category well enough
  }

  const handleFavoriteClick = (item) => {
    // Restore state from favorite
    dispatch({ type: ActionTypes.SET_CATEGORY, payload: item.category });
    // Use timeout again for simplicity, ideally a dedicated action
    setTimeout(() => {
      dispatch({ type: ActionTypes.SET_FROM_UNIT, payload: item.fromUnit });
      dispatch({ type: ActionTypes.SET_TO_UNIT, payload: item.toUnit });
      // Optionally clear input/output when loading favorite?
      dispatch({ type: ActionTypes.SET_INPUT_VALUE, payload: '' });
    }, 0);
  };

  const handleRemoveFavorite = (id, event) => {
    event.stopPropagation(); // Prevent triggering handleFavoriteClick
    dispatch({ type: ActionTypes.REMOVE_FAVORITE, payload: id });
  };

  // Helper function to format unit display name
  const getUnitDisplayName = (unitSymbol) => {
    // Pass only categories now
    const details = getUnitDetails(unitSymbol, categories);
    if (!details) return unitSymbol; // Fallback
    return `${details.name} ${details.name_zh ? `(${details.name_zh})` : ''}`;
  };

  return (
    <Box>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Favorites
      </Typography>
      
      {favorites.length === 0 ? (
        <Typography 
          sx={{ 
            color: 'text.secondary', 
            textAlign: 'center', 
            py: 2 
          }}
        >
          No favorites saved yet.
        </Typography>
      ) : (
        <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
          <List dense disablePadding>
            {favorites.map((item) => (
              <ListItem 
                key={item.id} 
                button 
                onClick={() => handleFavoriteClick(item)}
                divider={favorites.indexOf(item) !== favorites.length - 1}
                sx={{ pr: 7 }} // Leave space for delete button
              >
                <ListItemText 
                  primary={`${getUnitDisplayName(item.fromUnit)} to ${getUnitDisplayName(item.toUnit)}`}
                />
                <ListItemSecondaryAction>
                  <MuiIconButton
                    edge="end"
                    size="small"
                    onClick={(e) => handleRemoveFavorite(item.id, e)}
                    aria-label={`Remove favorite ${item.fromUnit} to ${item.toUnit}`}
                    color="error"
                  >
                    <DeleteIcon />
                  </MuiIconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default FavoritesList; 