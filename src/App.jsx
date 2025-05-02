import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import styled from 'styled-components';
import Layout from './components/Layout';
import CategorySelector from './components/CategorySelector';
import UnitSelector from './components/UnitSelector';
import NumericInput from './components/NumericInput';
import ConversionResult from './components/ConversionResult';
import IconButton from './components/IconButton'; // Assuming an icon for swap
// import { SwapIcon } from './assets/icons'; // Placeholder for swap icon
import { useConversionContext } from './contexts/useConversionContext';
import { ActionTypes } from './contexts/ConversionContext';
import { convertUnit } from './utils/conversions';
import Decimal from 'decimal.js';
import { media } from './utils/styles'; // Import media query helper
import HistoryList from './components/HistoryList'; // Import HistoryList
import FavoriteButton from './components/FavoriteButton'; // Import FavoriteButton
import FavoritesList from './components/FavoritesList'; // Import FavoritesList
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'; // Import ErrorBoundary
import { useTheme } from './contexts/ThemeContext'; // Import useTheme

// Lazy load components
// const LazyCustomUnitManager = lazy(() => import('./components/CustomUnitManager/CustomUnitManager')); // Removed
// const LazySearchComponent = lazy(() => import('./components/SearchComponent/SearchComponent')); // Removed

// Placeholder icons (moved from Layout.jsx)
const SunIcon = () => <span>☀️</span>;
const MoonIcon = () => <span>🌙</span>;

const ConversionWrapper = styled.div`
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.background};

  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;

  @media ${media.mobile} {
    padding: 1rem;
    height: auto;
  }
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
  flex-shrink: 0;
  gap: 1rem; // Add gap for buttons
`;

const TopRowRight = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem; // Gap between buttons
`;

const CategorySelectorWrapper = styled.div`
  margin-bottom: 1rem;
  padding: 0 0.5rem;
  flex-shrink: 0;
`;

const InputRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
  flex-shrink: 0;

  @media ${media.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

const InputField = styled.div`
  flex-grow: 1;
  @media ${media.mobile} {
    width: 100%;
  }
`;

const SwapButtonWrapper = styled.div`
  margin-bottom: 1rem;

  @media ${media.mobile} {
    align-self: center;
    margin-bottom: 0.5rem;
    margin-top: 0.5rem;
    transform: rotate(90deg);
  }
`;

const ConversionResultWrapper = styled.div`
  margin-top: 1rem;
  padding: 0 0.5rem;
  flex-shrink: 0;
`;

const CustomUnitsButtonWrapper = styled.div`
  margin-top: 1rem;
  padding: 0 0.5rem;
  flex-shrink: 0;
`;

const InfoSections = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1.5rem;
  padding: 1rem 0.5rem 0;
  border-top: 1px solid ${({ theme }) => theme.listBorder};
  flex-grow: 1;
  overflow: hidden;
  min-height: 100px;

  & > div {
    flex: 1;
    overflow-y: auto;
    max-height: 100%;
  }

  @media ${media.mobile} {
    flex-direction: column;
    gap: 1rem;
    flex-grow: 0;
    min-height: auto;
    overflow: visible;
    padding: 1rem 0;
    & > div {
      overflow-y: visible;
      max-height: none;
    }
  }
`;

function App() {
  const { state, dispatch } = useConversionContext();
  const { categories, selectedCategory, fromUnit, toUnit, inputValue, outputValue, favorites, error } = state;
  // const [searchResults, setSearchResults] = useState([]); // Removed search state
  // const [isSearching, setIsSearching] = useState(false); // Removed search state
  const { theme, toggleTheme } = useTheme();

  // Memoize category list for selector
  const categoryOptions = useMemo(() => {
    // Consider adding categories that ONLY have custom units?
    return Object.entries(categories).map(([id, data]) => ({
      id,
      // Use category name if available, otherwise fallback to ID
      name: data.name || data.units[data.baseUnit]?.name || id,
      baseUnitSymbol: data.units[data.baseUnit]?.symbol || ''
    }));
  }, [categories]);

  // Memoize unit lists for selectors based on selected category, including custom units
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

  // Handle favorite button click
  const handleToggleFavorite = () => {
    if (isCurrentFavorite) {
      dispatch({ type: ActionTypes.REMOVE_FAVORITE, payload: currentFavoriteId });
    } else {
      dispatch({ type: ActionTypes.ADD_FAVORITE, payload: { category: selectedCategory, fromUnit, toUnit } });
    }
  };

  return (
    <Layout>
      <ErrorBoundary>
        <ConversionWrapper>
          <TopRow>
            {/* Removed Search Component */}
            {/* Spacer or adjust justify-content if needed */}
            <div style={{ flexGrow: 1 }}></div> {/* Example spacer */}
            <TopRowRight>
                <FavoriteButton isFavorite={isCurrentFavorite} onClick={handleToggleFavorite} />
                <IconButton onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                  {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                </IconButton>
            </TopRowRight>
          </TopRow>
          {/* Wrap CategorySelector - Adjust selector component if needed */}
          <CategorySelectorWrapper>
            <CategorySelector
              categories={categoryOptions}
              selectedCategory={selectedCategory}
              onChange={handleCategoryChange}
            />
          </CategorySelectorWrapper>

          <InputRow>
            <InputField>
              <NumericInput
                label="Value"
                id="input-value"
                value={inputValue}
                onChange={handleInputChange}
              />
            </InputField>
            <UnitSelector
              label="From"
              units={currentUnits}
              selectedUnit={fromUnit}
              onChange={handleFromUnitChange}
              id="from-unit"
            />

            <SwapButtonWrapper>
              {/* Replace span with actual SwapIcon component later */}
              <IconButton onClick={handleSwap} aria-label="Swap units">
                <span>&#8644;</span> {/* Basic swap symbol */}
              </IconButton>
            </SwapButtonWrapper>

            <UnitSelector
              label="To"
              units={currentUnits}
              selectedUnit={toUnit}
              onChange={handleToUnitChange}
              id="to-unit"
            />
          </InputRow>

          {/* Wrap ConversionResult */}
          <ConversionResultWrapper>
            <ConversionResult
              result={outputValue}
              error={error}
              onOutputChange={handleOutputChange}
            />
          </ConversionResultWrapper>

          {/* Removed Custom Units Button and Section */}
          {/* <CustomUnitsButtonWrapper>
            <button onClick={() => setShowCustomUnitsManager(true)}>Manage Custom Units</button>
          </CustomUnitsButtonWrapper> */}
          {/* {showCustomUnitsManager && ( ... )} */}

          {/* InfoSections will now grow and handle internal scroll */}
          <InfoSections>
            <HistoryList />
            <FavoritesList />
          </InfoSections>

        </ConversionWrapper>
      </ErrorBoundary>
    </Layout>
  );
}

export default App;
