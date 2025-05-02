import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Paper,
  ClickAwayListener,
  Typography
} from '@mui/material';
import { searchUnits } from '../utils/search';
import { useConversionContext } from '../contexts/useConversionContext';
import { ActionTypes } from '../contexts/ConversionContext';
import useDebounce from '../hooks/useDebounce'; // Assuming a debounce hook exists or will be created

const SearchInput = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300); // Debounce search input
  const { dispatch } = useConversionContext();
  const inputRef = useRef(null);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      const searchResults = searchUnits(debouncedQuery);
      setResults(searchResults);
      setIsOpen(true);
      setHighlightedIndex(-1); // Reset highlight on new results
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [debouncedQuery]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleResultClick = (result) => {
    // Dispatch actions to set category and units
    dispatch({ type: ActionTypes.SET_CATEGORY, payload: result.categoryId });
    // Timeout to ensure category updates before units
    setTimeout(() => {
      // Try setting both from and to units based on search?
      // For simplicity, let's just set the 'from' unit for now.
      dispatch({ type: ActionTypes.SET_FROM_UNIT, payload: result.symbol });
      // Optionally clear the 'to' unit or set a default?
    }, 0);
    setQuery(''); // Clear input
    setIsOpen(false); // Close results
  };

  // Basic keyboard navigation (ArrowDown, ArrowUp, Enter)
  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault(); // Prevent cursor move
        setHighlightedIndex((prev) => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        if (highlightedIndex >= 0) {
          handleResultClick(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleClickAway = () => {
    setIsOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: 250 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search units..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => query && setResults(searchUnits(query)) && setIsOpen(true)} // Reopen on focus if there was a query
          onKeyDown={handleKeyDown}
          inputRef={inputRef}
          variant="outlined"
        />
        {isOpen && (
          <Paper 
            elevation={3} 
            sx={{ 
              position: 'absolute', 
              top: '100%', 
              left: 0, 
              right: 0, 
              maxHeight: 250, 
              overflow: 'auto', 
              zIndex: 10,
              mt: 0.5,
              borderRadius: 1
            }}
          >
            <List dense disablePadding>
              {results.length > 0 ? (
                results.map((result, index) => (
                  <ListItem
                    key={`${result.categoryId}-${result.symbol}`}
                    onClick={() => handleResultClick(result)}
                    selected={index === highlightedIndex}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    button
                    sx={{ py: 1 }}
                  >
                    <ListItemText 
                      primary={`${result.name} (${result.symbol}) - [${result.categoryId}]`}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem sx={{ py: 1 }}>
                  <ListItemText 
                    primary={
                      <Typography color="text.secondary">
                        No units found.
                      </Typography>
                    }
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default SearchInput; 