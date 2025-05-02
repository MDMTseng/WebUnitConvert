import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './SearchComponent.module.css';

// Helper for highlighting matched text (case-insensitive)
const HighlightMatch = ({ text, query }) => {
  if (!query) {
    return text;
  }
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => (
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className={styles.highlight}>{part}</mark>
        ) : (
          part
        )
      ))}
    </>
  );
};
HighlightMatch.propTypes = { text: PropTypes.string.isRequired, query: PropTypes.string.isRequired };

const SearchComponent = ({
  placeholder = 'Search...',
  initialValue = '',
  onSearch,
  results = [],
  isLoading = false,
  onResultSelect = () => {}, // Add placeholder prop for selection
}) => {
  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1); // State for keyboard focus
  const searchContainerRef = useRef(null);
  const resultsListRef = useRef(null); // Ref for scrolling results

  const handleInputChange = (event) => {
    const newQuery = event.target.value;
    setQuery(newQuery);
    onSearch(newQuery);
    setIsOpen(!!newQuery);
    setFocusedIndex(-1); // Reset focus on new input
  };

  // Keyboard navigation handler
  const handleKeyDown = (event) => {
    if (!isOpen || results.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0)); // Can go to -1? Let's stick to 0.
        break;
      case 'Enter':
        if (focusedIndex >= 0) {
          event.preventDefault();
          onResultSelect(results[focusedIndex]);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Scroll focused item into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && resultsListRef.current) {
      const list = resultsListRef.current;
      const item = list.children[focusedIndex];
      if (item) {
        // Basic scroll into view, more complex logic might be needed for perfect centering
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset focus when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  return (
    <div className={styles.searchContainer} ref={searchContainerRef}>
      <input
        type="text"
        className={styles.searchInput}
        placeholder={placeholder}
        value={query}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(!!query && results.length > 0)} // Open on focus only if query+results exist
        onKeyDown={handleKeyDown} // Add keydown handler
        aria-label="Search"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls="search-results-list" // ID for the results list
        // Link input focus to list item focus
        aria-activedescendant={focusedIndex >= 0 ? `search-result-${results[focusedIndex].symbol}-${results[focusedIndex].categoryId}` : undefined}
      />
      {isOpen && (
        <div className={styles.searchResults}>
          {isLoading ? (
            <div className={styles.loading}>Loading...</div>
          ) : results.length > 0 ? (
            <ul id="search-results-list" role="listbox" ref={resultsListRef}>
              {results.map((result, index) => {
                const itemKey = `${result.symbol}-${result.categoryId || index}`;
                const isFocused = index === focusedIndex;
                return (
                  <li
                    key={itemKey}
                    id={`search-result-${itemKey}`}
                    className={`${styles.resultItem} ${isFocused ? styles.focused : ''}`}
                    role="option"
                    aria-selected={isFocused}
                    // Handle click selection
                    onClick={() => {
                      onResultSelect(result);
                      setIsOpen(false);
                    }}
                    // Optional: scroll to item on mouse over to sync with keyboard focus
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    <HighlightMatch text={`${result.name} (${result.symbol})`} query={query} />
                    <span className={styles.categoryName}> - {result.categoryName}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className={styles.noResults}>No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

// Add PropTypes definitions
SearchComponent.propTypes = {
  placeholder: PropTypes.string,
  initialValue: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
  results: PropTypes.array,
  isLoading: PropTypes.bool,
  onResultSelect: PropTypes.func, // Add prop type for selection handler
};

export default SearchComponent;
