/**
 * Safely retrieves an item from localStorage.
 * @param {string} key The key of the item to retrieve.
 * @param {any} defaultValue The value to return if the key is not found or an error occurs.
 * @returns {any} The retrieved item or the default value.
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    // Parse stored json or return raw string
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

/**
 * Safely sets an item in localStorage.
 * @param {string} key The key of the item to set.
 * @param {any} value The value to set (will be stringified).
 * @returns {boolean} True if the item was set successfully, false otherwise.
 */
export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting localStorage key “${key}”:`, error);
    return false;
  }
};

/**
 * Safely removes an item from localStorage.
 * @param {string} key The key of the item to remove.
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key “${key}”:`, error);
  }
}; 