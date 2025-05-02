import React, { createContext, useReducer, useEffect, useRef } from 'react';
import { getUnitRegistry } from '../utils/conversions'; // Assuming registry is needed
import { getItem, setItem } from '../utils/localStorage'; // Import localStorage utils

// --- Constants ---
const MAX_HISTORY_LENGTH = 20; // Max number of history items
const HISTORY_STORAGE_KEY = 'conversionHistory'; // Key for localStorage
const FAVORITES_STORAGE_KEY = 'conversionFavorites'; // Key for favorites
const DEBOUNCE_DELAY = 2000; // 2 seconds debounce for history entries

// --- Initial State ---
const initialState = {
  categories: getUnitRegistry(),
  selectedCategory: 'length',
  fromUnit: 'm',
  toUnit: 'ft',
  inputValue: '',
  outputValue: null,
  error: null,
  history: [],
  favorites: [],
  pendingHistoryEntry: null, // To store pending history entry during debounce
};

// --- Action Types ---
const ActionTypes = {
  SET_CATEGORY: 'SET_CATEGORY',
  SET_FROM_UNIT: 'SET_FROM_UNIT',
  SET_TO_UNIT: 'SET_TO_UNIT',
  SET_INPUT_VALUE: 'SET_INPUT_VALUE',
  SET_OUTPUT_VALUE: 'SET_OUTPUT_VALUE',
  SET_ERROR: 'SET_ERROR',
  SWAP_UNITS: 'SWAP_UNITS',
  ADD_TO_HISTORY: 'ADD_TO_HISTORY', // Debounced action
  CLEAR_HISTORY: 'CLEAR_HISTORY',
  LOAD_HISTORY: 'LOAD_HISTORY',
  SET_PENDING_HISTORY: 'SET_PENDING_HISTORY', // New action to store pending entry
  // Favorites Actions
  ADD_FAVORITE: 'ADD_FAVORITE',
  REMOVE_FAVORITE: 'REMOVE_FAVORITE',
  LOAD_FAVORITES: 'LOAD_FAVORITES',
};

// --- Reducer ---
const conversionReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_CATEGORY:
      // When category changes, reset units and input/output
      const newCategoryUnits = Object.keys(state.categories[action.payload].units);
      return {
        ...initialState, // Reset most state
        history: state.history, // Keep history when category changes
        favorites: state.favorites, // Keep favorites
        categories: state.categories, // Keep registry
        selectedCategory: action.payload,
        fromUnit: newCategoryUnits[0], // Default to first unit in new category
        toUnit: newCategoryUnits[1] || newCategoryUnits[0], // Default to second or first
      };
    case ActionTypes.SET_FROM_UNIT:
      return { ...state, fromUnit: action.payload };
    case ActionTypes.SET_TO_UNIT:
      return { ...state, toUnit: action.payload };
    case ActionTypes.SET_INPUT_VALUE:
      // Reset output/error when input changes
      return { ...state, inputValue: action.payload, outputValue: null, error: null };
    case ActionTypes.SET_OUTPUT_VALUE: {
      // Only prepare history entry if there's a valid input and output
      if (state.inputValue && state.inputValue !== '-' && action.payload) {
        // Create the potential history entry but don't add it immediately
        const newHistoryEntry = {
          id: Date.now(), // Simple unique ID using timestamp
          category: state.selectedCategory,
          fromUnit: state.fromUnit,
          toUnit: state.toUnit,
          inputValue: state.inputValue,
          outputValue: action.payload, // The calculated output
          timestamp: new Date().toISOString(),
        };
        
        return {
          ...state,
          outputValue: action.payload,
          error: null,
          pendingHistoryEntry: newHistoryEntry, // Store pending entry for debounce
        };
      }
      
      // If no valid input or output, just update output without adding to history
      return {
        ...state,
        outputValue: action.payload,
        error: null
      };
    }
    case ActionTypes.ADD_TO_HISTORY: {
      // Only add to history if there's a pending entry
      if (!action.payload) return state;
      
      // Add to beginning and limit length
      const updatedHistory = [action.payload, ...state.history].slice(0, MAX_HISTORY_LENGTH);
      
      return {
        ...state,
        history: updatedHistory,
        pendingHistoryEntry: null, // Clear pending entry
      };
    }
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, outputValue: null };
    case ActionTypes.SWAP_UNITS: {
      // Swap from/to units and input/output values
      const currentOutput = state.outputValue;
      return {
        ...state,
        fromUnit: state.toUnit,
        toUnit: state.fromUnit,
        inputValue: currentOutput ? currentOutput.toString() : '',
        outputValue: null, // Reset output, needs recalculation
        error: null,
        pendingHistoryEntry: null, // Clear any pending entries
      };
    }
    case ActionTypes.CLEAR_HISTORY:
      return { ...state, history: [] };
    case ActionTypes.LOAD_HISTORY: // For loading from storage later
      // Ensure loaded history is an array and respects max length
      const loadedHistory = Array.isArray(action.payload) ? action.payload.slice(0, MAX_HISTORY_LENGTH) : [];
      return { ...state, history: loadedHistory };

    // Favorites Reducers
    case ActionTypes.ADD_FAVORITE: {
      // Payload should be { category, fromUnit, toUnit }
      // Generate a unique ID for the favorite (simple approach)
      const newFavorite = { ...action.payload, id: `${action.payload.category}-${action.payload.fromUnit}-${action.payload.toUnit}` };
      // Avoid adding duplicates
      if (state.favorites.some(fav => fav.id === newFavorite.id)) {
        return state; // Already exists
      }
      return { ...state, favorites: [...state.favorites, newFavorite] };
    }
    case ActionTypes.REMOVE_FAVORITE: {
      // Payload should be the id of the favorite to remove
      const updatedFavorites = state.favorites.filter(fav => fav.id !== action.payload);
      return { ...state, favorites: updatedFavorites };
    }
    case ActionTypes.LOAD_FAVORITES:
      const loadedFavorites = Array.isArray(action.payload) ? action.payload : [];
      return { ...state, favorites: loadedFavorites };

    default:
      return state;
  }
};

// --- Context ---
const ConversionContext = createContext({
  state: initialState,
  dispatch: () => null,
});

// --- Provider Component ---
export const ConversionProvider = ({ children }) => {
  const init = (initialState) => {
    const loadedHistory = getItem(HISTORY_STORAGE_KEY, []);
    const loadedFavorites = getItem(FAVORITES_STORAGE_KEY, []);
    return {
      ...initialState,
      history: loadedHistory,
      favorites: loadedFavorites,
    };
  };

  const [state, dispatch] = useReducer(conversionReducer, initialState, init);
  const historyTimeoutRef = useRef(null);

  // Debounce the history entry addition
  useEffect(() => {
    // If there's a pending history entry, set up the debounce
    if (state.pendingHistoryEntry) {
      // Clear any existing timeout
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
      
      // Set a new timeout
      historyTimeoutRef.current = setTimeout(() => {
        dispatch({ 
          type: ActionTypes.ADD_TO_HISTORY, 
          payload: state.pendingHistoryEntry 
        });
      }, DEBOUNCE_DELAY);
      
      // Clean up timeout on unmount or when pendingHistoryEntry changes
      return () => {
        if (historyTimeoutRef.current) {
          clearTimeout(historyTimeoutRef.current);
        }
      };
    }
  }, [state.pendingHistoryEntry]);

  // Persist history and favorites to localStorage whenever they change
  useEffect(() => {
    // Avoid saving the initial empty array before it's loaded
    if (state.history.length > 0 || getItem(HISTORY_STORAGE_KEY) !== null) {
       setItem(HISTORY_STORAGE_KEY, state.history);
    }
  }, [state.history]); // Run whenever state.history changes

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (state.favorites.length > 0 || getItem(FAVORITES_STORAGE_KEY) !== null) {
        setItem(FAVORITES_STORAGE_KEY, state.favorites);
    }
  }, [state.favorites]);

  return (
    <ConversionContext.Provider value={{ state, dispatch }}>
      {children}
    </ConversionContext.Provider>
  );
};

// Export context, action types, reducer, and initial state for testing/use
export { ConversionContext, ActionTypes, conversionReducer, initialState }; 