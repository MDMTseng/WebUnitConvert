import { describe, it, expect, vi } from 'vitest';
import { conversionReducer, ActionTypes, initialState } from '../../contexts/ConversionContext'; // Adjust path if needed
import Decimal from 'decimal.js';

// Mock initial state for tests - grab categories from actual initialState
const testInitialState = { ...initialState }; // Shallow copy is fine here

describe('Conversion Reducer', () => {
  it('should return the initial state by default', () => {
    expect(conversionReducer(undefined, {})).toEqual(testInitialState);
  });

  it('should handle SET_CATEGORY', () => {
    const action = { type: ActionTypes.SET_CATEGORY, payload: 'weight' };
    const state = conversionReducer(testInitialState, action);
    expect(state.selectedCategory).toBe('weight');
    expect(state.fromUnit).toBe('kg'); // First unit of weight
    expect(state.toUnit).toBe('g'); // Second unit of weight
    expect(state.inputValue).toBe('');
    expect(state.outputValue).toBeNull();
  });

  it('should handle SET_FROM_UNIT', () => {
    const action = { type: ActionTypes.SET_FROM_UNIT, payload: 'km' };
    const state = conversionReducer(testInitialState, action);
    expect(state.fromUnit).toBe('km');
  });

  it('should handle SET_TO_UNIT', () => {
    const action = { type: ActionTypes.SET_TO_UNIT, payload: 'mi' };
    const state = conversionReducer(testInitialState, action);
    expect(state.toUnit).toBe('mi');
  });

  it('should handle SET_INPUT_VALUE', () => {
    const previousState = { ...testInitialState, outputValue: new Decimal(10), error: 'Some error' };
    const action = { type: ActionTypes.SET_INPUT_VALUE, payload: '123' };
    const state = conversionReducer(previousState, action);
    expect(state.inputValue).toBe('123');
    expect(state.outputValue).toBeNull(); // Should reset output
    expect(state.error).toBeNull(); // Should reset error
  });

  it('should handle SET_OUTPUT_VALUE', () => {
    const previousState = { ...testInitialState, error: 'Some error' };
    const output = new Decimal(456);
    const action = { type: ActionTypes.SET_OUTPUT_VALUE, payload: output };
    const state = conversionReducer(previousState, action);
    expect(state.outputValue).toBe(output);
    expect(state.error).toBeNull(); // Should reset error
  });

  it('should handle SET_ERROR', () => {
    const previousState = { ...testInitialState, outputValue: new Decimal(10) };
    const action = { type: ActionTypes.SET_ERROR, payload: 'Test error' };
    const state = conversionReducer(previousState, action);
    expect(state.error).toBe('Test error');
    expect(state.outputValue).toBeNull(); // Should reset output
  });

  it('should handle SWAP_UNITS', () => {
    const previousState = {
      ...testInitialState,
      fromUnit: 'm',
      toUnit: 'ft',
      inputValue: '10',
      outputValue: new Decimal(32.8084),
      error: null,
    };
    const action = { type: ActionTypes.SWAP_UNITS };
    const state = conversionReducer(previousState, action);
    expect(state.fromUnit).toBe('ft');
    expect(state.toUnit).toBe('m');
    expect(state.inputValue).toBe('32.8084'); // Input becomes previous output
    expect(state.outputValue).toBeNull(); // Output resets
    expect(state.error).toBeNull();
  });

  it('should handle SWAP_UNITS when outputValue is null', () => {
    const previousState = {
      ...testInitialState,
      fromUnit: 'kg',
      toUnit: 'lb',
      inputValue: '5',
      outputValue: null,
      error: null,
    };
    const action = { type: ActionTypes.SWAP_UNITS };
    const state = conversionReducer(previousState, action);
    expect(state.fromUnit).toBe('lb');
    expect(state.toUnit).toBe('kg');
    expect(state.inputValue).toBe(''); // Input becomes empty string
    expect(state.outputValue).toBeNull();
    expect(state.error).toBeNull();
  });

  it('should handle SET_CATEGORY and preserve history', () => {
    const prevState = { ...testInitialState, history: [{ id: 1 }] };
    const action = { type: ActionTypes.SET_CATEGORY, payload: 'weight' };
    const state = conversionReducer(prevState, action);
    expect(state.selectedCategory).toBe('weight');
    expect(state.history).toEqual([{ id: 1 }]); // History should be kept
  });

  it('should handle SET_OUTPUT_VALUE and add to history', () => {
    const prevState = {
      ...testInitialState,
      selectedCategory: 'length',
      fromUnit: 'm',
      toUnit: 'ft',
      inputValue: '10',
      history: [],
    };
    const output = new Decimal(32.8084);
    const action = { type: ActionTypes.SET_OUTPUT_VALUE, payload: output.toString() }; // Assuming payload is string

    // Mock Date.now() for predictable ID
    vi.spyOn(Date, 'now').mockImplementation(() => 1234567890);

    const state = conversionReducer(prevState, action);

    expect(state.outputValue).toBe(output.toString());
    expect(state.history).toHaveLength(1);
    expect(state.history[0]).toMatchObject({
      id: 1234567890,
      category: 'length',
      fromUnit: 'm',
      toUnit: 'ft',
      inputValue: '10',
      outputValue: output.toString(),
    });
    expect(state.history[0].timestamp).toBeDefined();

    // Restore mock
    vi.restoreAllMocks();
  });

  it('should limit history length', () => {
    // Create initial history with items 0 to 19
    const initialHistory = Array.from({ length: 20 }, (_, i) => ({ id: i }));
    const prevState = {
      ...testInitialState,
      inputValue: '1',
      fromUnit: 'm',
      toUnit: 'km',
      history: initialHistory,
    };
    const output = new Decimal(0.001);
    const action = { type: ActionTypes.SET_OUTPUT_VALUE, payload: output.toString() };

    vi.spyOn(Date, 'now').mockImplementation(() => 9999); // New item ID

    const state = conversionReducer(prevState, action);
    expect(state.history).toHaveLength(20); // Should still be 20
    expect(state.history[0].id).toBe(9999); // Newest item (9999) should be first
    // The original item with id 19 was pushed out.
    // The original item with id 18 is now the last element.
    expect(state.history[19].id).toBe(18); // Oldest remaining item (id 18) should be last

    vi.restoreAllMocks();
  });

  it('should handle ADD_TO_HISTORY manually', () => {
    const newEntry = { id: 1, value: 'test' };
    const action = { type: ActionTypes.ADD_TO_HISTORY, payload: newEntry };
    const state = conversionReducer(testInitialState, action);
    expect(state.history).toHaveLength(1);
    expect(state.history[0]).toEqual(newEntry);
  });

  it('should handle CLEAR_HISTORY', () => {
    const prevState = { ...testInitialState, history: [{ id: 1 }, { id: 2 }] };
    const action = { type: ActionTypes.CLEAR_HISTORY };
    const state = conversionReducer(prevState, action);
    expect(state.history).toHaveLength(0);
  });

  it('should handle LOAD_HISTORY', () => {
    const loaded = [{ id: 100 }, { id: 101 }];
    const action = { type: ActionTypes.LOAD_HISTORY, payload: loaded };
    const state = conversionReducer(testInitialState, action);
    expect(state.history).toEqual(loaded);
  });

  it('should handle LOAD_HISTORY with more than max items', () => {
    const loaded = Array.from({ length: 25 }, (_, i) => ({ id: i }));
    const action = { type: ActionTypes.LOAD_HISTORY, payload: loaded };
    const state = conversionReducer(testInitialState, action);
    expect(state.history).toHaveLength(20); // Should be truncated
    expect(state.history[0].id).toBe(0);
    expect(state.history[19].id).toBe(19);
  });

  it('should handle LOAD_HISTORY with invalid payload', () => {
    const action = { type: ActionTypes.LOAD_HISTORY, payload: null };
    const state = conversionReducer(testInitialState, action);
    expect(state.history).toEqual([]);
  });
});

describe('Conversion Reducer - Favorites', () => {
  const fav1 = { category: 'length', fromUnit: 'm', toUnit: 'ft', id: 'length-m-ft' };
  const fav2 = { category: 'weight', fromUnit: 'kg', toUnit: 'lb', id: 'weight-kg-lb' };

  it('should handle ADD_FAVORITE', () => {
    const action = { type: ActionTypes.ADD_FAVORITE, payload: { category: 'length', fromUnit: 'm', toUnit: 'ft' } };
    const state = conversionReducer(testInitialState, action);
    expect(state.favorites).toHaveLength(1);
    expect(state.favorites[0]).toEqual(fav1);
  });

  it('should not add duplicate favorites', () => {
    const prevState = { ...testInitialState, favorites: [fav1] };
    const action = { type: ActionTypes.ADD_FAVORITE, payload: { category: 'length', fromUnit: 'm', toUnit: 'ft' } }; // Same as fav1
    const state = conversionReducer(prevState, action);
    expect(state.favorites).toHaveLength(1);
  });

  it('should handle REMOVE_FAVORITE', () => {
    const prevState = { ...testInitialState, favorites: [fav1, fav2] };
    const action = { type: ActionTypes.REMOVE_FAVORITE, payload: fav1.id }; // Remove by id
    const state = conversionReducer(prevState, action);
    expect(state.favorites).toHaveLength(1);
    expect(state.favorites[0]).toEqual(fav2);
  });

  it('should handle REMOVE_FAVORITE with non-existent id', () => {
    const prevState = { ...testInitialState, favorites: [fav1, fav2] };
    const action = { type: ActionTypes.REMOVE_FAVORITE, payload: 'non-existent-id' };
    const state = conversionReducer(prevState, action);
    expect(state.favorites).toHaveLength(2);
  });

  it('should handle LOAD_FAVORITES', () => {
    const loaded = [fav1, fav2];
    const action = { type: ActionTypes.LOAD_FAVORITES, payload: loaded };
    const state = conversionReducer(testInitialState, action);
    expect(state.favorites).toEqual(loaded);
  });

   it('should handle LOAD_FAVORITES with invalid payload', () => {
    const action = { type: ActionTypes.LOAD_FAVORITES, payload: 'not-an-array' };
    const state = conversionReducer(testInitialState, action);
    expect(state.favorites).toEqual([]);
  });

  it('should preserve favorites when category changes', () => {
    const prevState = { ...testInitialState, favorites: [fav1] };
    const action = { type: ActionTypes.SET_CATEGORY, payload: 'weight' };
    const state = conversionReducer(prevState, action);
    expect(state.selectedCategory).toBe('weight');
    expect(state.favorites).toEqual([fav1]); // Favorites should be kept
  });

}); 