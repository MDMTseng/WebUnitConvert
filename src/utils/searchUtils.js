import Fuse from 'fuse.js';

/**
 * Prepares a flat list of all units from the categories object for Fuse.js indexing.
 * @param {object} categories - The categories object from ConversionContext state.
 * @returns {Array<object>} - A flat array of unit objects including category info.
 */
const prepareFuseData = (categories) => {
  const allUnits = [];
  Object.entries(categories).forEach(([categoryId, categoryData]) => {
    const categoryName = categoryData.units[categoryData.baseUnit]?.name || categoryId;
    Object.entries(categoryData.units).forEach(([symbol, unitData]) => {
      allUnits.push({
        symbol,
        name: unitData.name || '',
        categoryId,
        categoryName,
        ...unitData,
      });
    });
  });
  return allUnits;
};

// Memoize the Fuse instance creation if categories don't change often
let fuseInstance = null;
let lastCategories = null;

/**
 * Searches units using Fuse.js for fuzzy matching.
 * @param {object} categories - The categories object.
 * @param {string} query - The search query.
 * @returns {Array<object>} - Array of matching unit items.
 */
export const searchUnits = (categories, query) => {
  if (!query || query.trim().length < 1) return []; // Allow searching from 1 character

  // Re-create Fuse instance only if categories have changed
  if (categories !== lastCategories) {
    const allUnits = prepareFuseData(categories);
    const options = {
      keys: ['name', 'symbol'],
      threshold: 0.4, // Adjust threshold as needed (lower is stricter)
      includeScore: false, // Don't need score for basic results
      ignoreLocation: true, // Search anywhere in the string
      minMatchCharLength: 1,
    };
    fuseInstance = new Fuse(allUnits, options);
    lastCategories = categories;
  }

  if (!fuseInstance) return []; // Should not happen if categories exist

  const results = fuseInstance.search(query.trim());
  // Limit results for performance/UI
  return results.map(result => result.item).slice(0, 10);
};

/**
 * Basic debounce function.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {Function} - The debounced function.
 */
export const debounce = (func, delay = 250) => { // Slightly shorter delay maybe
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}; 