import React, { useEffect, useMemo, useState } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Divider, 
  Typography, 
  Paper, 
  IconButton as MuiIconButton,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import Layout from './components/Layout';
import CategorySelector from './components/CategorySelector';
import UnitSelector from './components/UnitSelector';
import NumericInput from './components/NumericInput';
import ConversionResult from './components/ConversionResult';
import { useConversionContext } from './contexts/useConversionContext';
import { ActionTypes } from './contexts/ConversionContext';
import { convertUnit } from './utils/conversions';
import Decimal from 'decimal.js';
import HistoryList from './components/HistoryList';
import FavoriteButton from './components/FavoriteButton';
import FavoritesList from './components/FavoritesList';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const { state, dispatch } = useConversionContext();
  const { categories, selectedCategory, fromUnit, toUnit, inputValue, outputValue, favorites, error } = state;
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme.mode === 'dark';

  // Memoize category list for selector
  const categoryOptions = useMemo(() => {
    return Object.entries(categories).map(([id, data]) => ({
      id,
      name: data.name || data.units[data.baseUnit]?.name || id,
      baseUnitSymbol: data.units[data.baseUnit]?.symbol || ''
    }));
  }, [categories]);

  // Memoize unit lists for selectors based on selected category
  const currentUnits = useMemo(() => {
    const categoryData = categories[selectedCategory];
    if (!categoryData) return [];

    const standardUnits = Object.entries(categoryData.units).map(([symbol, unitData]) => ({
      symbol,
      name: unitData.name,
      name_zh: unitData.name_zh,
    }));

    return standardUnits.sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, selectedCategory]);

  // Handle category change
  const handleCategoryChange = (e) => {
    dispatch({ type: ActionTypes.SET_CATEGORY, payload: e.target.value });
  };

  // Handle unit changes
  const handleFromUnitChange = (e) => {
    dispatch({ type: ActionTypes.SET_FROM_UNIT, payload: e.target.value });
  };

  const handleToUnitChange = (e) => {
    dispatch({ type: ActionTypes.SET_TO_UNIT, payload: e.target.value });
  };

  // Handle input change from the PRIMARY input box
  const handleInputChange = (value) => {
    dispatch({ type: ActionTypes.SET_INPUT_VALUE, payload: value });
  };

  // Handle input change from the RESULT input box
  const handleOutputChange = (newOutputValue) => {
    if (newOutputValue === '' || newOutputValue === '-') {
        dispatch({ type: ActionTypes.SET_INPUT_VALUE, payload: '' });
        return;
    }
    try {
        const valueDecimal = new Decimal(newOutputValue);
        if (valueDecimal.isNaN()) return;
        // Perform REVERSE conversion without custom units
        const reversedResult = convertUnit(valueDecimal, toUnit, fromUnit);
        if (reversedResult !== null) {
            dispatch({ type: ActionTypes.SET_INPUT_VALUE, payload: reversedResult.toString() });
        }
    } catch (err) {
        console.error("Reverse conversion error:", err);
    }
  };

  // Perform FORWARD conversion when relevant state changes
  useEffect(() => {
    if (inputValue === '' || inputValue === '-') {
      dispatch({ type: ActionTypes.SET_OUTPUT_VALUE, payload: null });
      dispatch({ type: ActionTypes.SET_ERROR, payload: null });
      return;
    }
    try {
      const valueDecimal = new Decimal(inputValue);
      if (valueDecimal.isNaN()) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'Invalid input value' });
        return;
      }
      
      // Only proceed with conversion if we have a meaningful value
      if (valueDecimal.isZero() && !inputValue.includes('.')) {
        // Don't record history for plain zero inputs (0) without decimal points
        dispatch({ type: ActionTypes.SET_OUTPUT_VALUE, payload: '0' });
        return;
      }
      
      // Call convertUnit without customUnits
      const result = convertUnit(valueDecimal, fromUnit, toUnit);
      if (result === null) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'Conversion failed' });
      } else {
        // This is where the forward conversion result is set
        dispatch({ type: ActionTypes.SET_OUTPUT_VALUE, payload: result.toString() });
        // Error is cleared automatically in the reducer when output is set
      }
    } catch (err) {
      console.error("Forward conversion error:", err);
      dispatch({ type: ActionTypes.SET_ERROR, payload: 'Calculation error' });
    }
  }, [inputValue, fromUnit, toUnit, dispatch]);

  // Handle swap
  const handleSwap = () => {
    dispatch({ type: ActionTypes.SWAP_UNITS });
  };

  // Check if current selection is a favorite
  const currentFavoriteId = `${selectedCategory}-${fromUnit}-${toUnit}`;
  const isCurrentFavorite = useMemo(() => {
      return favorites.some(fav => fav.id === currentFavoriteId);
  }, [favorites, currentFavoriteId]);

  // Handle add/remove favorite
  const handleToggleFavorite = () => {
    if (isCurrentFavorite) {
      dispatch({
        type: ActionTypes.REMOVE_FAVORITE,
        payload: currentFavoriteId
      });
    } else {
      dispatch({
        type: ActionTypes.ADD_FAVORITE,
        payload: {
          id: currentFavoriteId,
          category: selectedCategory,
          fromUnit,
          toUnit,
          name: `${fromUnit} → ${toUnit}` // Default name
        }
      });
    }
  };

  // Handle clicking a favorite
  const handleFavoriteClick = (favorite) => {
    dispatch({ type: ActionTypes.SET_CATEGORY, payload: favorite.category });
    // Units are set in useEffect below when category changes
    // to ensure units exist for the category
  };

  // Set units when favorite is clicked and category changes
  useEffect(() => {
    const foundFavorite = favorites.find(f => f.id === `${selectedCategory}-${fromUnit}-${toUnit}`);
    if (foundFavorite) {
      // We're already on this favorite, nothing to do
      return;
    }

    // Find any favorite for this category
    const categoryFavorite = favorites.find(f => f.category === selectedCategory);
    if (categoryFavorite) {
      dispatch({ type: ActionTypes.SET_FROM_UNIT, payload: categoryFavorite.fromUnit });
      dispatch({ type: ActionTypes.SET_TO_UNIT, payload: categoryFavorite.toUnit });
    } else {
      // If no favorite for this category, set default units
      const categoryData = categories[selectedCategory];
      if (categoryData) {
        const unitSymbols = Object.keys(categoryData.units);
        if (unitSymbols.length > 0) {
          if (unitSymbols.includes(categoryData.baseUnit)) {
            // Use base unit as fromUnit if available
            dispatch({ type: ActionTypes.SET_FROM_UNIT, payload: categoryData.baseUnit });
          } else {
            dispatch({ type: ActionTypes.SET_FROM_UNIT, payload: unitSymbols[0] });
          }
          // For toUnit, pick a different unit if possible
          if (unitSymbols.length > 1) {
            const toUnitIndex = unitSymbols[0] === categoryData.baseUnit ? 1 : 0;
            dispatch({ type: ActionTypes.SET_TO_UNIT, payload: unitSymbols[toUnitIndex] });
          } else {
            dispatch({ type: ActionTypes.SET_TO_UNIT, payload: unitSymbols[0] });
          }
        }
      }
    }
  }, [selectedCategory, categories, favorites]);

  return (
    <Layout>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        overflow: 'auto',
        gap: 1
      }}>
        <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 0.5 
              }}>
                <Typography variant="h5" component="h1">Unit Converter</Typography>
                <Stack direction="row" spacing={0.5}>
                  <MuiIconButton 
                    onClick={toggleTheme} 
                    color="primary" 
                    size="small"
                    aria-label="toggle dark/light mode"
                  >
                    {isDarkMode ? <Brightness7 /> : <Brightness4 />}
                  </MuiIconButton>
                  <FavoriteButton
                    isFavorite={isCurrentFavorite}
                    onClick={handleToggleFavorite}
                    disabled={!selectedCategory || !fromUnit || !toUnit}
                  />
                </Stack>
              </Box>
            
              <CategorySelector
                categories={categoryOptions}
                selectedCategory={selectedCategory}
                onChange={handleCategoryChange}
              />
            </Grid>
            
            <Grid item xs={12} md={5}>
              <UnitSelector
                label="From Unit"
                units={currentUnits}
                selectedUnit={fromUnit}
                onChange={handleFromUnitChange}
                id="from-unit-select"
              />
              <NumericInput
                label="Value"
                id="input-value"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Enter value"
              />
            </Grid>
            
            <Grid item xs={12} md={2} sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              mt: { xs: 0, md: 2 }
            }}>
              <MuiIconButton 
                onClick={handleSwap} 
                aria-label="Swap units"
                color="primary"
                size="small"
                sx={{ 
                  transform: { xs: 'rotate(90deg)', md: 'rotate(0)' }
                }}
              >
                <SwapVertIcon />
              </MuiIconButton>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <UnitSelector
                label="To Unit"
                units={currentUnits}
                selectedUnit={toUnit}
                onChange={handleToUnitChange}
                id="to-unit-select"
              />
              <ConversionResult 
                result={outputValue} 
                error={error}
                onOutputChange={handleOutputChange}
              />
            </Grid>
          </Grid>
        </Paper>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 1,
          flexGrow: 1,
          minHeight: 0
        }}>
          <Paper sx={{ 
            flex: 1, 
            p: 1.5,
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <ErrorBoundary fallback={<div>Error loading favorites</div>}>
              <FavoritesList />
            </ErrorBoundary>
          </Paper>
          
          <Paper sx={{ 
            flex: 1, 
            p: 1.5,
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <ErrorBoundary fallback={<div>Error loading history</div>}>
              <HistoryList />
            </ErrorBoundary>
          </Paper>
        </Box>
      </Box>
    </Layout>
  );
}

export default App;
