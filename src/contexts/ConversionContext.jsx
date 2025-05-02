import React, { createContext, useReducer, useEffect, useRef } from 'react';
import { getUnitRegistry } from '../utils/conversions'; // Assuming registry is needed
import { getItem, setItem } from '../utils/localStorage'; // Import localStorage utils

// --- Constants ---
const MAX_HISTORY_LENGTH = 20; // Max number of history items
const HISTORY_STORAGE_KEY = 'conversionHistory'; // Key for localStorage
const FAVORITES_STORAGE_KEY = 'conversionFavorites'; // Key for favorites
const APP_STATE_STORAGE_KEY = 'conversionAppState'; // Key for application state
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
  selectingFromHistory: false, // Flag to track when user selects from history
  isUserInput: false, // Track if input change is from user vs. programmatic
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
  SET_SELECTING_FROM_HISTORY: 'SET_SELECTING_FROM_HISTORY', // Flag for history selection
  SET_USER_INPUT: 'SET_USER_INPUT', // Track if input is from user
  RESTORE_STATE: 'RESTORE_STATE', // Restore full app state
  // Favorites Actions
  ADD_FAVORITE: 'ADD_FAVORITE',
  REMOVE_FAVORITE: 'REMOVE_FAVORITE',
  LOAD_FAVORITES: 'LOAD_FAVORITES',
};

// --- Reducer ---
const conversionReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.RESTORE_STATE:
      // Restore full app state but keep categories
      return {
        ...state,
        ...action.payload,
        categories: state.categories, // Keep registry
      };
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
        selectingFromHistory: state.selectingFromHistory, // Keep the selection flag state
      };
    case ActionTypes.SET_FROM_UNIT:
      return { ...state, fromUnit: action.payload };
    case ActionTypes.SET_TO_UNIT:
      return { ...state, toUnit: action.payload };
    case ActionTypes.SET_USER_INPUT:
      return { 
        ...state, 
        isUserInput: action.payload,
        // If this is a user input (true), clear the selecting from history flag
        selectingFromHistory: action.payload ? false : state.selectingFromHistory
      };
    case ActionTypes.SET_INPUT_VALUE:
      // Reset output/error when input changes
      return { 
        ...state, 
        inputValue: action.payload, 
        outputValue: null, 
        error: null,
        // Only reset selectingFromHistory if this is a user input
        // AND the user is not in the process of selecting from history
        selectingFromHistory: state.isUserInput ? false : state.selectingFromHistory 
      };
    case ActionTypes.SET_SELECTING_FROM_HISTORY:
      return {
        ...state,
        selectingFromHistory: action.payload,
        // When selecting from history, always set isUserInput to false
        isUserInput: action.payload ? false : state.isUserInput
      };
    case ActionTypes.SET_OUTPUT_VALUE: {
      // Only prepare history entry if:
      // 1. There's a valid input and output
      // 2. We're not currently selecting from history
      // 3. The input change came from the user (isUserInput is true)
      if (state.inputValue && 
          state.inputValue !== '-' && 
          action.payload && 
          !state.selectingFromHistory &&
          state.isUserInput) {
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
      
      // If no valid input or output or selecting from history, 
      // just update output without adding to history
      return {
        ...state,
        outputValue: action.payload,
        error: null,
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
        selectingFromHistory: false, // Reset history selection flag
        isUserInput: false, // This is a programmatic change, not user input
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
    // Load history and favorites
    const loadedHistory = getItem(HISTORY_STORAGE_KEY, []);
    const loadedFavorites = getItem(FAVORITES_STORAGE_KEY, []);
    
    // Try to load saved app state
    const savedAppState = getItem(APP_STATE_STORAGE_KEY, null);
    
    if (savedAppState) {
      // If we have saved state, restore it but keep the registry and other fixed values
      return {
        ...initialState,
        history: loadedHistory,
        favorites: loadedFavorites,
        selectedCategory: savedAppState.selectedCategory || initialState.selectedCategory,
        fromUnit: savedAppState.fromUnit || initialState.fromUnit,
        toUnit: savedAppState.toUnit || initialState.toUnit,
        inputValue: savedAppState.inputValue || initialState.inputValue,
        outputValue: savedAppState.outputValue || initialState.outputValue,
      };
    }
    
    // Default initialization if no saved state
    return {
      ...initialState,
      history: loadedHistory,
      favorites: loadedFavorites,
    };
  };

  const [state, dispatch] = useReducer(conversionReducer, initialState, init);
  const historyTimeoutRef = useRef(null);

  // Save app state when window is about to close or user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Create a simplified version of the state to save (exclude internal flags)
      const stateToSave = {
        selectedCategory: state.selectedCategory,
        fromUnit: state.fromUnit,
        toUnit: state.toUnit,
        inputValue: state.inputValue,
        outputValue: state.outputValue,
      };
      
      setItem(APP_STATE_STORAGE_KEY, stateToSave);
    };
    
    // Add event listener for when the user is about to leave
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state.selectedCategory, state.fromUnit, state.toUnit, state.inputValue, state.outputValue]);

  // Periodically save app state during use (as a backup)
  useEffect(() => {
    const saveStateInterval = setInterval(() => {
      const stateToSave = {
        selectedCategory: state.selectedCategory,
        fromUnit: state.fromUnit,
        toUnit: state.toUnit,
        inputValue: state.inputValue,
        outputValue: state.outputValue,
      };
      
      setItem(APP_STATE_STORAGE_KEY, stateToSave);
    }, 10000); // Save every 10 seconds
    
    return () => {
      clearInterval(saveStateInterval);
    };
  }, [state.selectedCategory, state.fromUnit, state.toUnit, state.inputValue, state.outputValue]);

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