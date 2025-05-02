import { getUnitRegistry } from './conversions';

// Flatten the unit registry for easier searching
let flatUnitList = null;

const generateFlatUnitList = () => {
  const registry = getUnitRegistry();
  const list = [];
  for (const categoryId in registry) {
    const category = registry[categoryId];
    for (const unitSymbol in category.units) {
      list.push({
        categoryId,
        symbol: unitSymbol,
        name: category.units[unitSymbol].name,
        // Add category name for display?
      });
    }
  }
  return list;
};

/**
 * Searches the flattened unit list by name or symbol.
 * @param {string} query The search query.
 * @returns {Array} An array of matching unit objects.
 */
export const searchUnits = (query) => {
  if (!flatUnitList) {
    flatUnitList = generateFlatUnitList();
  }

  if (!query || query.trim() === '') {
    return []; // Return empty if query is empty
  }

  const lowerCaseQuery = query.toLowerCase();

  // Simple search logic: match name or symbol (case-insensitive)
  const results = flatUnitList.filter(
    (unit) =>
      unit.name.toLowerCase().includes(lowerCaseQuery) ||
      unit.symbol.toLowerCase().includes(lowerCaseQuery)
  );

  return results.slice(0, 10); // Limit results for performance/UI
}; 