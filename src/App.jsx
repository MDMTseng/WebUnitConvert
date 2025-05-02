import React, { useEffect, useMemo, useState, useCallback, lazy, Suspense } from 'react';
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
import { searchUnits, debounce } from './utils/searchUtils'; // Import search utils
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'; // Import ErrorBoundary

// Lazy load components
const LazyCustomUnitManager = lazy(() => import('./components/CustomUnitManager/CustomUnitManager'));
const LazySearchComponent = lazy(() => import('./components/SearchComponent/SearchComponent'));

const ConversionWrapper = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.borderColor};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: ${({ theme }) => theme.background};

  @media ${media.mobile} {
    margin: 1rem;
    padding: 1rem;
    border: none;
    box-shadow: none;
  }
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h2 {
    margin: 0;
    color: ${({ theme }) => theme.text};
  }
`;

const InputRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 1rem;

  @media ${media.mobile} {
    flex-direction: column; // Stack vertically on mobile
    align-items: stretch; // Stretch items to full width
    gap: 0.5rem; // Reduce gap for stacked layout
  }
`;

const InputField = styled.div`
  flex-grow: 1;
  @media ${media.mobile} {
    width: 100%; // Ensure full width when stacked
  }
`;

const SwapButtonWrapper = styled.div`
  margin-bottom: 1rem; /* Align with bottom of inputs on desktop */

  @media ${media.mobile} {
    align-self: center; // Center swap button when stacked
    margin-bottom: 0.5rem;
    margin-top: 0.5rem;
    // Rotate icon for vertical layout?
    transform: rotate(90deg);
  }
`;

// New styled component for History/Favorites section
const InfoSections = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.listBorder};

  & > div { // Target direct children (HistoryWrapper, FavoritesWrapper)
    flex: 1; // Each section takes half the space
  }

  @media ${media.mobile} {
    flex-direction: column;
    gap: 1rem;
  }
`;

function App() {
  const { state, dispatch } = useConversionContext();
  const { categories, selectedCategory, fromUnit, toUnit, inputValue, outputValue, favorites, customUnits } = state;
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCustomUnitsManager, setShowCustomUnitsManager] = useState(false); // Hypothetical state

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

    // Get standard units for the selected category
    const standardUnits = Object.entries(categoryData.units).map(([symbol, unitData]) => ({
      symbol,
      name: unitData.name,
      isCustom: false, // Flag standard units
    }));

    // Get custom units for the selected category
    const categoryCustomUnits = customUnits
      .filter(unit => unit.categoryId === selectedCategory)
      .map(unit => ({
        symbol: unit.symbol,
        name: unit.name,
        isCustom: true, // Flag custom units
      }));

    // Combine and sort (optional: sort custom units separately?)
    return [...standardUnits, ...categoryCustomUnits].sort((a, b) => a.name.localeCompare(b.name));

  }, [categories, selectedCategory, customUnits]); // Add customUnits dependency

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

  // Handle input change
  const handleInputChange = (value) => {
    dispatch({ type: ActionTypes.SET_INPUT_VALUE, payload: value });
  };

  // Perform conversion when relevant state changes
  useEffect(() => {
    if (inputValue === '' || inputValue === '-') {
      dispatch({ type: ActionTypes.SET_OUTPUT_VALUE, payload: null });
      dispatch({ type: ActionTypes.SET_ERROR, payload: null }); // Clear error on valid empty input
      return;
    }

    try {
      const valueDecimal = new Decimal(inputValue);
      if (valueDecimal.isNaN()) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'Invalid input value' });
        return;
      }

      // Pass customUnits array to the conversion function
      const result = convertUnit(valueDecimal, fromUnit, toUnit, customUnits);

      if (result === null) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'Conversion failed (check units)' });
      } else {
        dispatch({ type: ActionTypes.SET_OUTPUT_VALUE, payload: result.toString() });
      }
    } catch (err) {
      console.error("Conversion error:", err);
      dispatch({ type: ActionTypes.SET_ERROR, payload: 'An unexpected error occurred' });
    }
  }, [inputValue, fromUnit, toUnit, dispatch, customUnits]);

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

  // Debounced search handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (!query) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      // Simulate async search if needed, otherwise direct call:
      const results = searchUnits(categories, query);
      setSearchResults(results);
      setIsSearching(false);
    }, 300), // 300ms delay
    [categories] // Dependency: re-create debounce if categories change
  );

  // Handler passed to SearchComponent
  const handleSearch = (query) => {
    debouncedSearch(query);
  };

  // Handle selecting a result from search
  const handleResultSelect = (result) => {
    if (!result) return;

    dispatch({ type: ActionTypes.SET_CATEGORY, payload: result.categoryId });
    // Set the selected unit as the 'From' unit by default
    dispatch({ type: ActionTypes.SET_FROM_UNIT, payload: result.symbol });
    // Optionally set input value to 1 for immediate conversion
    dispatch({ type: ActionTypes.SET_INPUT_VALUE, payload: '1' });

    // Clear search results after selection
    setSearchResults([]);
    // Ideally, close the search dropdown (handled in SearchComponent)
    // Potentially focus the input value field here
  };

  return (
    <Layout>
      <ErrorBoundary>
        <ConversionWrapper>
          <TopRow>
            <h2>Unit Converter</h2>
            {/* Lazy load Search Component */}
            <Suspense fallback={<div>Loading Search...</div>}> {/* Or a more subtle placeholder */}
              <LazySearchComponent
                onSearch={handleSearch}
                placeholder="Search units..."
                results={searchResults} // Pass results
                isLoading={isSearching} // Pass loading state
                onResultSelect={handleResultSelect} // Pass selection handler
              />
            </Suspense>
            {/* Add Favorite Button */}
            <FavoriteButton isFavorite={isCurrentFavorite} onClick={handleToggleFavorite} />
          </TopRow>
          <CategorySelector
            categories={categoryOptions}
            selectedCategory={selectedCategory}
            onChange={handleCategoryChange}
          />

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

          <ConversionResult result={outputValue} error={state.error} />

          {/* Button to open Custom Unit Manager (Hypothetical) */}
          <button onClick={() => setShowCustomUnitsManager(true)}>Manage Custom Units</button>

          {/* Conditionally render Custom Unit Manager with Suspense */}
          {showCustomUnitsManager && (
            <Suspense fallback={<div>Loading Custom Unit Manager...</div>}>
              {/* Assume Modal wrapper or similar is handled inside CustomUnitManager or here */}
              <LazyCustomUnitManager />
            </Suspense>
          )}

          {/* Add History and Favorites Sections side-by-side */}
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
