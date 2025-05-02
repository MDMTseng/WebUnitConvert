import Decimal from 'decimal.js';

// --- Unit Registry ---
// Defines the available units and their conversion factors relative to a base unit for each category.
const unitRegistry = {
  length: {
    baseUnit: 'm',
    units: {
      m: { name: 'Meter', symbol: 'm', factor: new Decimal(1) },
      km: { name: 'Kilometer', symbol: 'km', factor: new Decimal(1000) },
      cm: { name: 'Centimeter', symbol: 'cm', factor: new Decimal(0.01) },
      mm: { name: 'Millimeter', symbol: 'mm', factor: new Decimal(0.001) },
      in: { name: 'Inch', symbol: 'in', factor: new Decimal(0.0254) },
      ft: { name: 'Foot', symbol: 'ft', factor: new Decimal(0.3048) },
      yd: { name: 'Yard', symbol: 'yd', factor: new Decimal(0.9144) },
      mi: { name: 'Mile', symbol: 'mi', factor: new Decimal(1609.34) },
    },
  },
  weight: {
    baseUnit: 'kg',
    units: {
      kg: { name: 'Kilogram', symbol: 'kg', factor: new Decimal(1) },
      g: { name: 'Gram', symbol: 'g', factor: new Decimal(0.001) },
      mg: { name: 'Milligram', symbol: 'mg', factor: new Decimal(0.000001) },
      lb: { name: 'Pound', symbol: 'lb', factor: new Decimal(0.453592) },
      oz: { name: 'Ounce', symbol: 'oz', factor: new Decimal(0.0283495) },
      t: { name: 'Metric Ton', symbol: 't', factor: new Decimal(1000) },
    },
  },
  temperature: {
    // Temperature is handled specially due to offsets, not just factors
    baseUnit: 'c', // Using Celsius as a reference, but direct formulas are needed
    units: {
      c: { name: 'Celsius', symbol: 'c' },
      f: { name: 'Fahrenheit', symbol: 'f' },
      k: { name: 'Kelvin', symbol: 'k' },
    },
  },
  // Add other categories (volume, time, digital storage) here later
};

// --- Conversion Logic ---

/**
 * Finds the category a unit belongs to.
 * @param {string} unitSymbol - The symbol of the unit (e.g., 'kg').
 * @returns {string|null} The category key (e.g., 'weight') or null if not found.
 */
const getCategoryForUnit = (unitSymbol) => {
  for (const categoryKey in unitRegistry) {
    if (unitRegistry[categoryKey].units[unitSymbol]) {
      return categoryKey;
    }
  }
  return null;
};

/**
 * Converts a value from one unit to another within the same category.
 *
 * @param {number|string|Decimal} value - The input value to convert.
 * @param {string} fromUnitSymbol - The symbol of the source unit (e.g., 'kg').
 * @param {string} toUnitSymbol - The symbol of the target unit (e.g., 'lb').
 * @returns {Decimal|null} The converted value as a Decimal object, or null if conversion is not possible.
 */
export const convertUnit = (value, fromUnitSymbol, toUnitSymbol) => {
  if (fromUnitSymbol === toUnitSymbol) {
    return new Decimal(value);
  }

  const categoryKey = getCategoryForUnit(fromUnitSymbol);
  if (!categoryKey || !unitRegistry[categoryKey].units[toUnitSymbol]) {
    console.error(`Conversion between ${fromUnitSymbol} and ${toUnitSymbol} is not supported or units are invalid.`);
    return null; // Units not found or not in the same category
  }

  const category = unitRegistry[categoryKey];
  const fromUnit = category.units[fromUnitSymbol];
  const toUnit = category.units[toUnitSymbol];
  const valDecimal = new Decimal(value);

  // Handle temperature separately
  if (categoryKey === 'temperature') {
    if (fromUnitSymbol === 'c') {
      if (toUnitSymbol === 'f') return valDecimal.times(9).dividedBy(5).plus(32);
      if (toUnitSymbol === 'k') return valDecimal.plus(273.15);
    } else if (fromUnitSymbol === 'f') {
      if (toUnitSymbol === 'c') return valDecimal.minus(32).times(5).dividedBy(9);
      if (toUnitSymbol === 'k') return valDecimal.minus(32).times(5).dividedBy(9).plus(273.15);
    } else if (fromUnitSymbol === 'k') {
      if (toUnitSymbol === 'c') return valDecimal.minus(273.15);
      if (toUnitSymbol === 'f') return valDecimal.minus(273.15).times(9).dividedBy(5).plus(32);
    }
    return null; // Should not happen if symbols are valid
  }

  // Standard conversion using factors relative to the base unit
  const valueInBaseUnit = valDecimal.times(fromUnit.factor);
  const valueInTargetUnit = valueInBaseUnit.dividedBy(toUnit.factor);

  return valueInTargetUnit;
};

/**
 * Returns the registry of all defined units, organized by category.
 * Primarily for populating UI selectors.
 *
 * @returns {object} The complete unit registry.
 */
export const getUnitRegistry = () => {
  // Return a deep clone to prevent accidental modification?
  // For now, return directly, but consider implications.
  return unitRegistry;
}; 