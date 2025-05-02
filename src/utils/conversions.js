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
  area: {
    name: 'Area',
    baseUnit: 'm²',
    units: {
      'm²': { name: '平方公尺', symbol: 'm²', factor: new Decimal(1) },
      'km²': { name: '平方公里', symbol: 'km²', factor: new Decimal(1e6) },
      ha: { name: '公頃', symbol: 'ha', factor: new Decimal(10000) },
      ping: { name: '坪', symbol: '坪', factor: new Decimal(3.30579) },
      jia: { name: '甲', symbol: '甲', factor: new Decimal(9699.2) },
      fen: { name: '分', symbol: '分', factor: new Decimal(969.92) },
      // Keep common units in English for wider audience?
      acre: { name: 'Acre', symbol: 'acre', factor: new Decimal(4046.86) },
      'ft²': { name: 'Square Foot', symbol: 'ft²', factor: new Decimal(0.092903) },
      'yd²': { name: 'Square Yard', symbol: 'yd²', factor: new Decimal(0.836127) },
    },
  },
};

// --- Conversion Logic ---

/**
 * Finds the category and unit data for a given unit symbol.
 * Checks both the standard registry and the provided custom units.
 * @param {string} unitSymbol - The symbol of the unit (e.g., 'kg', 'customSymbol').
 * @param {Array<object>} customUnits - Array of custom unit objects.
 * @returns {{categoryKey: string, unitData: object}|null} Object with category key and unit data, or null.
 */
const findUnitData = (unitSymbol, customUnits = []) => {
  // Check custom units first
  const customUnit = customUnits.find(u => u.symbol === unitSymbol);
  if (customUnit) {
    return {
      categoryKey: customUnit.categoryId,
      // Ensure custom unit data has a factorToBase property mapped to 'factor' for consistency here
      unitData: { ...customUnit, factor: new Decimal(customUnit.factorToBase) },
      isCustom: true,
    };
  }

  // Check standard registry
  for (const categoryKey of Object.keys(unitRegistry)) {
    const category = unitRegistry[categoryKey];
    if (category && category.units && category.units[unitSymbol]) {
      return {
        categoryKey,
        // Standard units already have a Decimal 'factor'
        unitData: category.units[unitSymbol],
        isCustom: false,
      };
    }
  }

  return null; // Unit not found
};

/**
 * Converts a value from one unit to another within the same category,
 * considering both standard and custom units.
 *
 * @param {number|string|Decimal} value - The input value to convert.
 * @param {string} fromUnitSymbol - The symbol of the source unit.
 * @param {string} toUnitSymbol - The symbol of the target unit.
 * @param {Array<object>} [customUnits=[]] - Optional array of custom units.
 * @returns {Decimal|null} The converted value as a Decimal object, or null if conversion is not possible.
 */
export const convertUnit = (value, fromUnitSymbol, toUnitSymbol, customUnits = []) => {
  if (fromUnitSymbol === toUnitSymbol) {
    return new Decimal(value);
  }

  const fromData = findUnitData(fromUnitSymbol, customUnits);
  const toData = findUnitData(toUnitSymbol, customUnits);

  if (!fromData || !toData) {
    console.error(`Cannot convert: Unit ${!fromData ? fromUnitSymbol : toUnitSymbol} not found.`);
    return null;
  }

  if (fromData.categoryKey !== toData.categoryKey) {
    console.error(`Cannot convert: Units ${fromUnitSymbol} and ${toUnitSymbol} are in different categories (${fromData.categoryKey} vs ${toData.categoryKey}).`);
    return null;
  }

  const categoryKey = fromData.categoryKey;
  const valDecimal = new Decimal(value);

  // Handle temperature separately (custom temperature units not supported by this logic)
  if (categoryKey === 'temperature') {
    if (fromData.isCustom || toData.isCustom) {
      console.error("Custom temperature units are not supported.");
      return null;
    }
    // Existing temperature logic...
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
    return null; // Should not happen
  }

  // Standard conversion using factors (factor/factorToBase normalized to 'factor')
  // Ensure factors are Decimal objects
  const fromFactor = new Decimal(fromData.unitData.factor);
  const toFactor = new Decimal(toData.unitData.factor);

  if (!fromFactor || !toFactor) { // Should be caught by findUnitData, but good practice
      console.error("Conversion factors missing.");
      return null;
  }

  const valueInBaseUnit = valDecimal.times(fromFactor);
  const valueInTargetUnit = valueInBaseUnit.dividedBy(toFactor);

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