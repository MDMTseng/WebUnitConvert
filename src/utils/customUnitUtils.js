const CUSTOM_UNITS_STORAGE_KEY = 'unitConverterCustomUnits';

/**
 * Retrieves custom units from local storage.
 * @returns {Array<object>} Array of custom unit objects or empty array.
 */
export const getCustomUnits = () => {
  try {
    const storedUnits = localStorage.getItem(CUSTOM_UNITS_STORAGE_KEY);
    return storedUnits ? JSON.parse(storedUnits) : [];
  } catch (error) {
    console.error("Error retrieving custom units from local storage:", error);
    return [];
  }
};

/**
 * Saves an array of custom units to local storage.
 * @param {Array<object>} units - The array of custom units to save.
 */
const saveCustomUnits = (units) => {
  try {
    localStorage.setItem(CUSTOM_UNITS_STORAGE_KEY, JSON.stringify(units));
  } catch (error) {
    console.error("Error saving custom units to local storage:", error);
    // Optionally, add user feedback here
  }
};

/**
 * Validates a new custom unit against existing units.
 * Checks for unique name/symbol within the category and positive factor.
 * @param {object} newUnit - The custom unit object to validate.
 * @param {Array<object>} existingUnits - The array of existing custom units.
 * @returns {string|null} Validation error message or null if valid.
 */
const validateCustomUnit = (newUnit, existingUnits) => {
  if (!newUnit || typeof newUnit !== 'object') return "Invalid unit data.";
  if (!newUnit.name?.trim()) return "Unit name is required.";
  if (!newUnit.symbol?.trim()) return "Unit symbol is required.";
  if (!newUnit.categoryId) return "Category is required.";
  if (typeof newUnit.factorToBase !== 'number' || newUnit.factorToBase <= 0) {
    return "Conversion factor must be a positive number.";
  }

  const nameLower = newUnit.name.trim().toLowerCase();
  const symbolLower = newUnit.symbol.trim().toLowerCase();

  const duplicate = existingUnits.find(unit =>
    unit.categoryId === newUnit.categoryId &&
    (unit.name.toLowerCase() === nameLower || unit.symbol.toLowerCase() === symbolLower)
  );

  if (duplicate) {
    const duplicateType = duplicate.name.toLowerCase() === nameLower ? 'name' : 'symbol';
    return `A unit with this ${duplicateType} already exists in the selected category.`;
  }

  return null; // Validation passed
};

/**
 * Adds a new custom unit after validation.
 * Generates a unique ID.
 * @param {object} unitData - Object containing { name, symbol, categoryId, factorToBase }.
 * @returns {{success: boolean, message?: string, units?: Array<object>}} Result object.
 */
export const addCustomUnit = (unitData) => {
  const existingUnits = getCustomUnits();
  const newUnit = {
    ...unitData,
    id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}` // Basic unique ID
  };

  const validationError = validateCustomUnit(newUnit, existingUnits);
  if (validationError) {
    return { success: false, message: validationError };
  }

  const updatedUnits = [...existingUnits, newUnit];
  saveCustomUnits(updatedUnits);
  return { success: true, units: updatedUnits };
};

/**
 * Updates an existing custom unit.
 * Requires the full updated unit object including its original ID.
 * @param {object} updatedUnit - The full custom unit object with updates.
 * @returns {{success: boolean, message?: string, units?: Array<object>}} Result object.
 */
export const updateCustomUnit = (updatedUnit) => {
  if (!updatedUnit?.id) {
    return { success: false, message: "Cannot update unit without an ID." };
  }
  const existingUnits = getCustomUnits();
  const otherUnits = existingUnits.filter(u => u.id !== updatedUnit.id);

  // Validate against other existing units
  const validationError = validateCustomUnit(updatedUnit, otherUnits);
  if (validationError) {
    return { success: false, message: validationError };
  }

  const unitIndex = existingUnits.findIndex(u => u.id === updatedUnit.id);
  if (unitIndex === -1) {
    return { success: false, message: "Unit not found for update." };
  }

  const updatedUnits = [...existingUnits];
  updatedUnits[unitIndex] = updatedUnit;
  saveCustomUnits(updatedUnits);
  return { success: true, units: updatedUnits };
};

/**
 * Deletes a custom unit by its ID.
 * @param {string} id - The ID of the custom unit to delete.
 * @returns {{success: boolean, units: Array<object>}} Result object with updated units.
 */
export const deleteCustomUnit = (id) => {
  const existingUnits = getCustomUnits();
  const updatedUnits = existingUnits.filter(unit => unit.id !== id);

  if (updatedUnits.length === existingUnits.length) {
    console.warn(`Custom unit with ID ${id} not found for deletion.`);
    // Still return success as the unit isn't present anyway
  }

  saveCustomUnits(updatedUnits);
  return { success: true, units: updatedUnits };
};

/**
 * Triggers a browser download for all custom units as a JSON file.
 */
export const exportCustomUnits = () => {
  try {
    const units = getCustomUnits();
    if (units.length === 0) {
      alert("No custom units to export.");
      return;
    }

    const jsonString = JSON.stringify(units, null, 2); // Pretty print JSON
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'unit-converter-custom-units.json'; // Filename
    document.body.appendChild(link); // Required for Firefox
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Error exporting custom units:", error);
    alert("Failed to export custom units.");
  }
};

/**
 * Imports custom units from a JSON file, skipping duplicates.
 * @param {File} file - The JSON file object.
 * @returns {Promise<{success: boolean, addedCount: number, skippedCount: number, error?: string}>}
 */
export const importCustomUnits = (file) => {
  return new Promise((resolve) => {
    if (!file || file.type !== 'application/json') {
      resolve({ success: false, addedCount: 0, skippedCount: 0, error: "Invalid file type. Please select a JSON file." });
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);

        if (!Array.isArray(importedData)) {
          throw new Error("Invalid JSON structure: Expected an array of units.");
        }

        const existingUnits = getCustomUnits();
        let addedCount = 0;
        let skippedCount = 0;
        const unitsToAdd = [];

        for (const importedUnit of importedData) {
          // Basic validation of the imported unit structure
          const validationError = validateCustomUnit(importedUnit, existingUnits);
          if (validationError) {
            // Check if the error is specifically a duplicate error
            if (validationError.includes('already exists')) {
                skippedCount++;
            } else {
                // Throw error for other validation issues
                throw new Error(`Invalid unit data found: ${validationError} for unit ${importedUnit.name || '(no name)'}`);
            }
          } else {
            // Add valid, non-duplicate unit (generate new ID to avoid collisions)
            unitsToAdd.push({
                name: importedUnit.name,
                symbol: importedUnit.symbol,
                categoryId: importedUnit.categoryId,
                factorToBase: importedUnit.factorToBase,
                id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
            });
            addedCount++;
          }
        }

        if (addedCount > 0) {
          const updatedUnits = [...existingUnits, ...unitsToAdd];
          saveCustomUnits(updatedUnits);
        }

        resolve({ success: true, addedCount, skippedCount });

      } catch (error) {
        console.error("Error importing custom units:", error);
        resolve({ success: false, addedCount: 0, skippedCount: 0, error: `Import failed: ${error.message}` });
      }
    };

    reader.onerror = () => {
      console.error("Error reading file for import.");
      resolve({ success: false, addedCount: 0, skippedCount: 0, error: "Failed to read the file." });
    };

    reader.readAsText(file);
  });
}; 