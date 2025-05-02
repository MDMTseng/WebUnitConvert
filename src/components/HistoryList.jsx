import React from 'react';
import styled from 'styled-components';
import { useConversionContext } from '../contexts/useConversionContext';
import { ActionTypes } from '../contexts/ConversionContext';
import { media } from '../utils/styles';
import IconButton from './IconButton';
// import { ClearIcon } from '../assets/icons'; // Placeholder

const ClearIcon = () => <span>🧹</span>; // Placeholder

const HistoryWrapper = styled.div`
  /* Inherits margin/padding from InfoSections in App.jsx */
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const HistoryTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text}; // Use theme
`;

const ClearButton = styled.button` // Use a standard button for clear
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
  background-color: ${({ theme }) => theme.clearButtonBg};
  color: ${({ theme }) => theme.clearButtonColor};
  border: 1px solid ${({ theme }) => theme.clearButtonBorder};
  border-radius: 4px;
  cursor: pointer;
  &:hover {
      background-color: ${({ theme }) => theme.clearButtonHover};
  }
`;

const HistoryListContainer = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.listBorder}; // Use theme
  border-radius: 4px;
  background-color: ${({ theme }) => theme.inputBg}; // Use theme for background
`;

const HistoryItem = styled.li`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.listBorder}; // Use theme
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  color: ${({ theme }) => theme.text}; // Use theme

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.listItemHover}; // Use theme
  }
`;

const HistoryDetails = styled.span`
  flex-grow: 1;
`;

const HistoryTimestamp = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text}99; // Use theme text with opacity
  white-space: nowrap; // Prevent wrapping
`;

const NoHistory = styled.p`
  color: ${({ theme }) => theme.text}88; // Use theme text with opacity
  text-align: center;
  padding: 1rem;
`;

const HistoryList = () => {
  const { state, dispatch } = useConversionContext();
  const { history } = state;

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

  return (
    <HistoryWrapper>
       <HistoryHeader>
            <HistoryTitle>History</HistoryTitle>
            {history.length > 0 && (
                <ClearButton onClick={handleClearHistory}>Clear</ClearButton>
            )}
        </HistoryHeader>
      {history.length === 0 ? (
        <NoHistory>No history yet.</NoHistory>
      ) : (
        <HistoryListContainer>
          {history.map((item) => (
            <HistoryItem key={item.id} onClick={() => handleHistoryClick(item)} title="Click to restore">
              <HistoryDetails>
                {item.inputValue} {item.fromUnit} → {item.outputValue} {item.toUnit}
              </HistoryDetails>
              <HistoryTimestamp>{formatTimestamp(item.timestamp)}</HistoryTimestamp>
            </HistoryItem>
          ))}
        </HistoryListContainer>
      )}
    </HistoryWrapper>
  );
};

export default HistoryList; 