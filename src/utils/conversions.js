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
  volume: {
    baseUnit: 'l',
    units: {
      l: { name: 'Liter', symbol: 'l', factor: new Decimal(1) },
      ml: { name: 'Milliliter', symbol: 'ml', factor: new Decimal(0.001) },
      gal: { name: 'Gallon (US)', symbol: 'gal', factor: new Decimal(3.78541) },
      qt: { name: 'Quart (US)', symbol: 'qt', factor: new Decimal(0.946353) },
      pt: { name: 'Pint (US)', symbol: 'pt', factor: new Decimal(0.473176) },
      cup: { name: 'Cup (US)', symbol: 'cup', factor: new Decimal(0.236588) },
      'fl oz': { name: 'Fluid Ounce (US)', symbol: 'fl oz', factor: new Decimal(0.0295735) },
      'm³': { name: 'Cubic Meter', symbol: 'm³', factor: new Decimal(1000) },
      'cm³': { name: 'Cubic Centimeter', symbol: 'cm³', factor: new Decimal(0.001) },
    },
  },
  time: {
    baseUnit: 's',
    units: {
      s: { name: 'Second', symbol: 's', factor: new Decimal(1) },
      ms: { name: 'Millisecond', symbol: 'ms', factor: new Decimal(0.001) },
      min: { name: 'Minute', symbol: 'min', factor: new Decimal(60) },
      h: { name: 'Hour', symbol: 'h', factor: new Decimal(3600) },
      d: { name: 'Day', symbol: 'd', factor: new Decimal(86400) },
      wk: { name: 'Week', symbol: 'wk', factor: new Decimal(604800) },
      mo: { name: 'Month (avg)', symbol: 'mo', factor: new Decimal(2628000) },
      yr: { name: 'Year (avg)', symbol: 'yr', factor: new Decimal(31536000) },
    },
  },
  digitalStorage: {
    baseUnit: 'b',
    units: {
      b: { name: 'Bit', symbol: 'b', factor: new Decimal(1) },
      B: { name: 'Byte', symbol: 'B', factor: new Decimal(8) },
      kb: { name: 'Kilobit', symbol: 'kb', factor: new Decimal(1000) },
      kB: { name: 'Kilobyte', symbol: 'kB', factor: new Decimal(8000) },
      Mb: { name: 'Megabit', symbol: 'Mb', factor: new Decimal(1e6) },
      MB: { name: 'Megabyte', symbol: 'MB', factor: new Decimal(8e6) },
      Gb: { name: 'Gigabit', symbol: 'Gb', factor: new Decimal(1e9) },
      GB: { name: 'Gigabyte', symbol: 'GB', factor: new Decimal(8e9) },
      Tb: { name: 'Terabit', symbol: 'Tb', factor: new Decimal(1e12) },
      TB: { name: 'Terabyte', symbol: 'TB', factor: new Decimal(8e12) },
    },
  },
};

// --- Conversion Logic ---

/**
 * Finds the category a unit belongs to.
 * @param {string} unitSymbol - The symbol of the unit (e.g., 'kg').
 * @returns {string|null} The category key (e.g., 'weight') or null if not found.
 */
const getCategoryForUnit = (unitSymbol) => {
  // Iterate through the category keys
  for (const categoryKey of Object.keys(unitRegistry)) {
    const category = unitRegistry[categoryKey];
    // Check if the units object exists and the symbol is a direct key within it
    if (category && category.units && category.units[unitSymbol]) {
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