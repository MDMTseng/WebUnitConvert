import React, { createContext, useReducer, useEffect } from 'react';
import { getUnitRegistry } from '../utils/conversions'; // Assuming registry is needed
import { getItem, setItem } from '../utils/localStorage'; // Import localStorage utils
import { getCustomUnits } from '../utils/customUnitUtils'; // Import custom unit util

// --- Constants ---
const MAX_HISTORY_LENGTH = 20; // Max number of history items
const HISTORY_STORAGE_KEY = 'conversionHistory'; // Key for localStorage
const FAVORITES_STORAGE_KEY = 'conversionFavorites'; // Key for favorites

// --- Initial State ---
const initialState = {
  // Consider fetching categories asynchronously later if registry grows
  categories: getUnitRegistry(), // Or simplify to just keys/names initially
  selectedCategory: 'length', // Default category
  fromUnit: 'm', // Default from unit
  toUnit: 'ft', // Default to unit
  inputValue: '', // Current input value as string
  outputValue: null, // Result of conversion (Decimal object or null)
  error: null, // Any conversion errors
  history: [], // Add history array
  favorites: [], // Add favorites array
  customUnits: [], // Add custom units state
  // Add preferences later
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
  ADD_TO_HISTORY: 'ADD_TO_HISTORY', // New action type
  CLEAR_HISTORY: 'CLEAR_HISTORY',   // New action type
  LOAD_HISTORY: 'LOAD_HISTORY',     // New action type (for loading from storage)
  // Favorites Actions
  ADD_FAVORITE: 'ADD_FAVORITE',
  REMOVE_FAVORITE: 'REMOVE_FAVORITE',
  LOAD_FAVORITES: 'LOAD_FAVORITES',
  LOAD_CUSTOM_UNITS: 'LOAD_CUSTOM_UNITS',
  SET_CUSTOM_UNITS: 'SET_CUSTOM_UNITS', // In case we update them via the context
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
      // When output is set successfully, add the conversion to history
      const newHistoryEntry = {
        id: Date.now(), // Simple unique ID using timestamp
        category: state.selectedCategory,
        fromUnit: state.fromUnit,
        toUnit: state.toUnit,
        inputValue: state.inputValue,
        outputValue: action.payload, // The calculated output
        timestamp: new Date().toISOString(),
      };
      // Add to beginning and limit length
      const updatedHistory = [newHistoryEntry, ...state.history].slice(0, MAX_HISTORY_LENGTH);

      return {
        ...state,
        outputValue: action.payload,
        error: null,
        history: updatedHistory, // Update history
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
      };
    }
    case ActionTypes.ADD_TO_HISTORY: // Could be used manually if needed, but SET_OUTPUT handles it now
      const historyToAdd = [action.payload, ...state.history].slice(0, MAX_HISTORY_LENGTH);
      return { ...state, history: historyToAdd };
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

    case ActionTypes.LOAD_CUSTOM_UNITS:
      // This action type might just trigger the load in useEffect
      // Or directly load and set here if preferred (less common)
      return state; // Or return { ...state, customUnits: getCustomUnits() };
    case ActionTypes.SET_CUSTOM_UNITS:
      // Used if CRUD operations update context directly (e.g., after save in Manager)
      return { ...state, customUnits: action.payload };

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
  // Initializer function for useReducer to load from localStorage
  const init = (initialState) => {
    const loadedHistory = getItem(HISTORY_STORAGE_KEY, []);
    const loadedFavorites = getItem(FAVORITES_STORAGE_KEY, []);
    const loadedCustomUnits = getCustomUnits();
    return {
      ...initialState,
      history: loadedHistory,
      favorites: loadedFavorites,
      customUnits: loadedCustomUnits,
    };
  };

  const [state, dispatch] = useReducer(conversionReducer, initialState, init);

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