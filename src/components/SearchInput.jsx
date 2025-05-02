import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { searchUnits } from '../utils/search';
import { useConversionContext } from '../contexts/useConversionContext';
import { ActionTypes } from '../contexts/ConversionContext';
import useDebounce from '../hooks/useDebounce'; // Assuming a debounce hook exists or will be created

const SearchWrapper = styled.div`
  position: relative;
  width: 250px; // Adjust width as needed
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem 0.8rem;
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.text};
  font-size: 0.9rem;
`;

const ResultsList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.inputBg};
  border: 1px solid ${({ theme }) => theme.listBorder};
  border-top: none;
  border-radius: 0 0 4px 4px;
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 250px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ResultItem = styled.li`
  padding: 0.6rem 0.8rem;
  cursor: pointer;
  color: ${({ theme }) => theme.text};
  font-size: 0.9rem;

  &:hover {
    background-color: ${({ theme }) => theme.listItemHover};
  }

  // Style for highlighted item (keyboard navigation)
  &.highlighted {
    background-color: ${({ theme }) => theme.listItemHover};
  }
`;

const NoResults = styled.div`
    padding: 0.6rem 0.8rem;
    color: ${({ theme }) => theme.text}88;
    font-size: 0.9rem;
`;

const SearchInput = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 300); // Debounce search input
  const { dispatch } = useConversionContext();
  const wrapperRef = useRef(null); // Ref for detecting outside clicks

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

  // Handle clicking outside to close results
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

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

  return (
    <SearchWrapper ref={wrapperRef}>
      <Input
        type="text"
        placeholder="Search units..."
        value={query}
        onChange={handleInputChange}
        onFocus={() => query && setResults(searchUnits(query)) && setIsOpen(true)} // Reopen on focus if there was a query
        onKeyDown={handleKeyDown}
      />
      {isOpen && (
        <ResultsList>
          {results.length > 0 ? (
            results.map((result, index) => (
              <ResultItem
                key={`${result.categoryId}-${result.symbol}`}
                onClick={() => handleResultClick(result)}
                className={index === highlightedIndex ? 'highlighted' : ''}
                onMouseEnter={() => setHighlightedIndex(index)} // Highlight on mouse hover
              >
                {result.name} ({result.symbol}) - [{result.categoryId}]
              </ResultItem>
            ))
          ) : (
            <NoResults>No units found.</NoResults>
          )}
        </ResultsList>
      )}
    </SearchWrapper>
  );
};

export default SearchInput; 