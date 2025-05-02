/**
 * Represents a category of units (e.g., Length, Weight).
 */
export const UnitCategory = {
  id: '', // unique identifier (e.g., 'length')
  name: '', // display name (e.g., 'Length')
  icon: '', // visual representation (optional)
  units: [], // array of Unit objects in this category
};

/**
 * Represents a specific unit of measurement (e.g., Meter, Kilogram).
 */
export const Unit = {
  id: '', // unique identifier (e.g., 'meter')
  name: '', // display name (e.g., 'Meter')
  symbol: '', // unit symbol (e.g., 'm')
  conversionFactor: 1, // factor relative to the category's base unit
};

/**
 * Represents a completed conversion operation.
 */
export const Conversion = {
  id: '', // unique identifier
  fromUnit: '', // symbol of the source unit
  toUnit: '', // symbol of the target unit
  inputValue: 0,
  outputValue: 0,
  timestamp: null, // Date object
};

/**
 * Represents user-specific preferences and data.
 */
export const UserPreference = {
  favoriteConversions: [], // array of saved Conversion objects or identifiers
  recentHistory: [], // array of recent Conversion objects
  theme: 'light', // 'light' or 'dark'
  customUnits: [], // array of user-defined Unit objects
}; 