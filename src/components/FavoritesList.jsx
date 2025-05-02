import React from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  IconButton
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
    // Set flag to indicate we're selecting from favorites/history
    // This will prevent adding entries to history when selecting a favorite
    dispatch({ type: ActionTypes.SET_SELECTING_FROM_HISTORY, payload: true });
    
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
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden' 
    }}>
      <Typography variant="subtitle1" component="h3" sx={{ mb: 0.5, flexShrink: 0 }}>
        Favorites
      </Typography>
      
      {favorites.length === 0 ? (
        <Typography 
          variant="body2"
          sx={{ 
            color: 'text.secondary', 
            textAlign: 'center', 
            py: 1
          }}
        >
          No favorites saved yet.
        </Typography>
      ) : (
        <Box sx={{ 
          overflow: 'auto', 
          flexGrow: 1,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1
        }}>
          <List dense disablePadding>
            {favorites.map((item) => (
              <ListItem 
                key={item.id} 
                button 
                onClick={() => handleFavoriteClick(item)}
                divider={favorites.indexOf(item) !== favorites.length - 1}
                sx={{ 
                  py: 0.5,
                  pr: 6 // Leave space for delete button 
                }}
              >
                <ListItemText 
                  primary={
                    <Box sx={{ fontSize: '0.875rem' }}>
                      {`${getUnitDisplayName(item.fromUnit)} to ${getUnitDisplayName(item.toUnit)}`}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => handleRemoveFavorite(item.id, e)}
                    aria-label={`Remove favorite ${item.fromUnit} to ${item.toUnit}`}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default FavoritesList; 