import React from 'react';
import styled from 'styled-components';
import { useConversionContext } from '../contexts/useConversionContext';
import { ActionTypes } from '../contexts/ConversionContext';
import IconButton from './IconButton';
// import { TrashIcon } from '../assets/icons'; // Placeholder

const TrashIcon = () => <span>🗑️</span>; // Placeholder

const FavoritesWrapper = styled.div`
  /* Inherits margin/padding from InfoSections in App.jsx */
`;

const FavoritesTitle = styled.h3`
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text}; // Use theme
`;

const FavoritesListContainer = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px; // Consistent height with history
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.listBorder}; // Use theme
  border-radius: 4px;
  background-color: ${({ theme }) => theme.inputBg}; // Use theme
`;

const FavoriteItem = styled.li`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.listBorder}; // Use theme
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  color: ${({ theme }) => theme.text}; // Use theme

  &:last-child {
    border-bottom: none;
  }
`;

const FavoriteDetails = styled.span`
  flex-grow: 1;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.text}; // Ensure text color on hover
  }
`;

const NoFavorites = styled.p`
  color: ${({ theme }) => theme.text}88; // Use theme text with opacity
  text-align: center;
  padding: 1rem;
`;

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
    <FavoritesWrapper>
      <FavoritesTitle>Favorites</FavoritesTitle>
      {favorites.length === 0 ? (
        <NoFavorites>No favorites saved yet.</NoFavorites>
      ) : (
        <FavoritesListContainer>
          {favorites.map((item) => (
            <FavoriteItem key={item.id}>
              <FavoriteDetails
                onClick={() => handleFavoriteClick(item)}
                title="Click to load this conversion setup"
              >
                {/* {item.category}: */}{/* Removed category display for brevity? */}
                 {getUnitDisplayName(item.fromUnit)} to {getUnitDisplayName(item.toUnit)}
              </FavoriteDetails>
              <IconButton
                 onClick={(e) => handleRemoveFavorite(item.id, e)}
                 aria-label={`Remove favorite ${item.fromUnit} to ${item.toUnit}`}
              >
                 <TrashIcon />
              </IconButton>
            </FavoriteItem>
          ))}
        </FavoritesListContainer>
      )}
    </FavoritesWrapper>
  );
};

export default FavoritesList; 