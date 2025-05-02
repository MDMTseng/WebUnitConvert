import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getCustomUnits,
  addCustomUnit,
  updateCustomUnit,
  deleteCustomUnit,
  // exportCustomUnits, // Harder to unit test directly
  // importCustomUnits, // Harder to unit test directly
} from './customUnitUtils';

// Mocks are handled by setupTests.js

describe('customUnitUtils', () => {

  beforeEach(() => {
    // Clear localStorage mock before each test
    localStorage.clear();
    // Reset mocks if needed (though setupTests does basic setup)
    vi.clearAllMocks();
  });

  it('getCustomUnits should return an empty array initially', () => {
    expect(getCustomUnits()).toEqual([]);
  });

  it('addCustomUnit should add a valid unit and save to localStorage', () => {
    const unitData = { name: 'Test Unit', symbol: 'TU', categoryId: 'length', factorToBase: 10 };
    const result = addCustomUnit(unitData);

    expect(result.success).toBe(true);
    expect(result.units).toHaveLength(1);
    expect(result.units[0]).toMatchObject(unitData);
    expect(result.units[0].id).toBeDefined();

    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
    const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
    expect(savedData).toHaveLength(1);
    expect(savedData[0].name).toBe('Test Unit');

    // Verify getCustomUnits retrieves the saved unit
    expect(getCustomUnits()).toEqual(result.units);
  });

  it('addCustomUnit should return error for duplicate symbol in same category', () => {
    const unit1 = { name: 'Test Unit 1', symbol: 'TU', categoryId: 'length', factorToBase: 10 };
    addCustomUnit(unit1); // Add the first one

    const unit2 = { name: 'Test Unit 2', symbol: 'TU', categoryId: 'length', factorToBase: 20 };
    const result = addCustomUnit(unit2);

    expect(result.success).toBe(false);
    expect(result.message).toContain('already exists in the selected category');
    expect(localStorage.setItem).toHaveBeenCalledTimes(1); // Only the first add should save
    expect(getCustomUnits()).toHaveLength(1);
  });

   it('addCustomUnit should allow duplicate symbol in different categories', () => {
    const unit1 = { name: 'Test Unit L', symbol: 'TU', categoryId: 'length', factorToBase: 10 };
    addCustomUnit(unit1);
    const unit2 = { name: 'Test Unit W', symbol: 'TU', categoryId: 'weight', factorToBase: 5 };
    const result = addCustomUnit(unit2);

    expect(result.success).toBe(true);
    expect(result.units).toHaveLength(2);
    expect(localStorage.setItem).toHaveBeenCalledTimes(2);
    expect(getCustomUnits()).toHaveLength(2);
  });

  it('addCustomUnit should return error for invalid factor', () => {
    const unit = { name: 'Bad Factor', symbol: 'BF', categoryId: 'length', factorToBase: 0 };
    const result = addCustomUnit(unit);
    expect(result.success).toBe(false);
    expect(result.message).toContain('positive number');
  });

  it('addCustomUnit should return error for missing fields', () => {
    const unit = { symbol: 'MF', categoryId: 'length', factorToBase: 1 };
    const result = addCustomUnit(unit);
    expect(result.success).toBe(false);
    expect(result.message).toContain('name is required');
  });

  it('deleteCustomUnit should remove a unit', () => {
    const unit1 = { name: 'To Delete', symbol: 'DEL', categoryId: 'length', factorToBase: 1 };
    const addResult = addCustomUnit(unit1);
    const unitIdToDelete = addResult.units[0].id;

    expect(getCustomUnits()).toHaveLength(1);

    const deleteResult = deleteCustomUnit(unitIdToDelete);
    expect(deleteResult.success).toBe(true);
    expect(deleteResult.units).toEqual([]);
    expect(localStorage.setItem).toHaveBeenCalledTimes(2); // Add + Delete
    expect(getCustomUnits()).toEqual([]);
  });

  it('updateCustomUnit should modify an existing unit', () => {
    const unit1 = { name: 'Initial Name', symbol: 'INIT', categoryId: 'length', factorToBase: 1 };
    const addResult = addCustomUnit(unit1);
    const unitToUpdate = { ...addResult.units[0], name: 'Updated Name', factorToBase: 5 };

    const updateResult = updateCustomUnit(unitToUpdate);
    expect(updateResult.success).toBe(true);
    expect(updateResult.units).toHaveLength(1);
    expect(updateResult.units[0].name).toBe('Updated Name');
    expect(updateResult.units[0].factorToBase).toBe(5);
    expect(localStorage.setItem).toHaveBeenCalledTimes(2); // Add + Update

    const finalUnits = getCustomUnits();
    expect(finalUnits[0].name).toBe('Updated Name');
  });

  it('updateCustomUnit should return error if trying to update with duplicate symbol', () => {
    const unit1 = { name: 'Unit One', symbol: 'U1', categoryId: 'length', factorToBase: 1 };
    const unit2 = { name: 'Unit Two', symbol: 'U2', categoryId: 'length', factorToBase: 2 };
    addCustomUnit(unit1);
    addCustomUnit(unit2);

    const unitToUpdate = { ...getCustomUnits()[1], symbol: 'U1' }; // Try to change U2's symbol to U1
    const result = updateCustomUnit(unitToUpdate);

    expect(result.success).toBe(false);
    expect(result.message).toContain('already exists');
    expect(localStorage.setItem).toHaveBeenCalledTimes(2); // Only the two adds
  });

   it('updateCustomUnit should return error for unit not found', () => {
    const unit = { id: 'non-existent-id', name: 'Ghost', symbol: 'GH', categoryId: 'length', factorToBase: 1 };
    const result = updateCustomUnit(unit);
    expect(result.success).toBe(false);
    expect(result.message).toContain('not found for update');
  });
}); 