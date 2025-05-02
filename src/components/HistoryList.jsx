import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemText,
  Paper
} from '@mui/material';
import ClearIcon from '@mui/icons-material/ClearAll';
import { useConversionContext } from '../contexts/useConversionContext';
import { ActionTypes } from '../contexts/ConversionContext';
import IconButton from './IconButton';

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

const HistoryList = () => {
  const { state, dispatch } = useConversionContext();
  const { history, categories } = state;

  const handleHistoryClick = (item) => {
    // Restore state from history
    dispatch({ type: ActionTypes.SET_CATEGORY, payload: item.category });
    // Need timeout to allow category state update before unit update
    setTimeout(() => {
      dispatch({ type: ActionTypes.SET_FROM_UNIT, payload: item.fromUnit });
      dispatch({ type: ActionTypes.SET_TO_UNIT, payload: item.toUnit });
      dispatch({ type: ActionTypes.SET_INPUT_VALUE, payload: item.inputValue });
      // Output will be recalculated by useEffect in App.jsx
    }, 0);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear the conversion history?')) {
      dispatch({ type: ActionTypes.CLEAR_HISTORY });
    }
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Helper function to format unit display name
  const getUnitDisplayName = (unitSymbol) => {
    const details = getUnitDetails(unitSymbol, categories);
    if (!details) return unitSymbol;
    return `${details.name} ${details.name_zh ? `(${details.name_zh})` : ''}`;
  };

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2
      }}>
        <Typography variant="h6" component="h3">
          History
        </Typography>
        {history.length > 0 && (
          <Button 
            variant="outlined" 
            size="small" 
            color="error" 
            onClick={handleClearHistory}
            startIcon={<ClearIcon />}
          >
            Clear
          </Button>
        )}
      </Box>
      
      {history.length === 0 ? (
        <Typography 
          sx={{ 
            color: 'text.secondary', 
            textAlign: 'center', 
            py: 2 
          }}
        >
          No history yet.
        </Typography>
      ) : (
        <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
          <List dense disablePadding>
            {history.map((item) => (
              <ListItem 
                key={item.id} 
                onClick={() => handleHistoryClick(item)} 
                button
                divider={history.indexOf(item) !== history.length - 1}
                sx={{ 
                  '&:hover': { 
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        {item.inputValue} {getUnitDisplayName(item.fromUnit)} → {item.outputValue} {getUnitDisplayName(item.toUnit)}
                      </span>
                      <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                        {formatTimestamp(item.timestamp)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default HistoryList; 