import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { convertUnit } from './conversions';
import Decimal from 'decimal.js';

// Set precision for Decimal.js for comparison
Decimal.set({ precision: 15 });

// Helper for comparing Decimal values by rounding
const expectDecimal = (actual, expected, decimalPlaces = 5) => {
  expect(actual).toBeInstanceOf(Decimal);
  const expectedDecimal = new Decimal(expected);
  // Compare after rounding both to the specified number of decimal places
  expect(actual.toDecimalPlaces(decimalPlaces).toString()).toBe(
    expectedDecimal.toDecimalPlaces(decimalPlaces).toString()
  );
};

// Mock custom units for testing
const mockCustomUnits = [
  {
    id: 'custom-1',
    name: 'Furlong',
    symbol: 'fur',
    categoryId: 'length',
    factorToBase: 201.168, // 1 Furlong = 201.168 meters
  },
  {
    id: 'custom-2',
    name: 'Stone',
    symbol: 'st',
    categoryId: 'weight',
    factorToBase: 6.35029, // 1 Stone = 6.35029 kg
  },
];

describe('convertUnit', () => {

  // Mock console.error before each test
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  // Restore console.error after each test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- Standard Units Tests (Keep a few representative ones) ---
  it('should convert meters to feet correctly', () => {
    const result = convertUnit(1, 'm', 'ft');
    expect(result).toBeInstanceOf(Decimal);
    expect(result.toFixed(4)).toBe('3.2808');
  });

  it('should convert kilograms to pounds correctly', () => {
    const result = convertUnit(1, 'kg', 'lb');
    expect(result.toFixed(4)).toBe('2.2046');
  });

  it('should return the same value when units are identical', () => {
    const result = convertUnit(10, 'm', 'm');
    expect(result.equals(10)).toBe(true);
  });

  // --- Temperature Tests (Keep representative ones) ---
  it('should convert Celsius to Fahrenheit correctly', () => {
    const result = convertUnit(0, 'c', 'f');
    expect(result.equals(32)).toBe(true);
  });

  it('should convert Fahrenheit to Celsius correctly', () => {
    const result = convertUnit(32, 'f', 'c');
    expect(result.equals(0)).toBe(true);
  });

  // --- Custom Units Tests ---
  it('should convert meters to custom Furlongs correctly', () => {
    const result = convertUnit(201.168, 'm', 'fur', mockCustomUnits);
    expect(result.toFixed(0)).toBe('1');
  });

  it('should convert custom Furlongs to feet correctly', () => {
    const result = convertUnit(1, 'fur', 'ft', mockCustomUnits);
    expect(result.toFixed(0)).toBe('660');
  });

  it('should convert custom Stones to kilograms correctly', () => {
    const result = convertUnit(1, 'st', 'kg', mockCustomUnits);
    expect(result.toFixed(5)).toBe('6.35029');
  });

  it('should convert kilograms to custom Stones correctly', () => {
    const result = convertUnit(6.35029, 'kg', 'st', mockCustomUnits);
    expect(result.toFixed(0)).toBe('1');
  });

  // --- Edge Cases & Errors Tests ---
  it('should return null for conversion between different categories', () => {
    const result = convertUnit(1, 'm', 'kg', mockCustomUnits);
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('different categories'));
  });

  it('should return null for conversion with unknown standard units', () => {
    const result = convertUnit(1, 'm', 'unknown');
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('not found'));

  });

  it('should return null for conversion with unknown custom units', () => {
    const result = convertUnit(1, 'm', 'unknownCustom', mockCustomUnits);
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
  });

  it('should return null for custom temperature units', () => {
    const customTemp = [{
        id: 'custom-t',
        name: 'Rankine',
        symbol: 'R',
        categoryId: 'temperature',
        factorToBase: 1 // Incorrect, but for testing the block
      }];
    const result = convertUnit(1, 'c', 'R', customTemp);
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith("Custom temperature units are not supported.");
  });

  // --- Length Conversions ---
  it('should convert kilometers to miles', () => {
    const result = convertUnit(5, 'km', 'mi');
    expectDecimal(result, 3.10686);
  });

  it('should convert inches to centimeters', () => {
    const result = convertUnit(12, 'in', 'cm');
    expectDecimal(result, 30.48);
  });

  // --- Weight Conversions ---
  it('should convert ounces to grams', () => {
    const result = convertUnit(16, 'oz', 'g');
    expectDecimal(result, 453.592);
  });

  // --- Temperature Conversions ---
  it('should convert Fahrenheit to Kelvin', () => {
    const result = convertUnit(212, 'f', 'k');
    expectDecimal(result, 373.15);
  });

  it('should convert Kelvin to Fahrenheit', () => {
    const result = convertUnit(373.15, 'k', 'f');
    expectDecimal(result, 212);
  });

  // --- Volume Conversions ---
  it('should convert liters to gallons (US)', () => {
    const result = convertUnit(10, 'l', 'gal');
    expectDecimal(result, 2.64172);
  });

  it('should convert milliliters to fluid ounces (US)', () => {
    const result = convertUnit(500, 'ml', 'fl oz');
    expectDecimal(result, 16.90703);
  });

  it('should convert cubic meters to liters', () => {
    const result = convertUnit(2, 'm³', 'l');
    expectDecimal(result, 2000);
  });

  // --- Time Conversions ---
  it('should convert hours to seconds', () => {
    const result = convertUnit(2, 'h', 's');
    expectDecimal(result, 7200);
  });

  it('should convert days to minutes', () => {
    const result = convertUnit(3, 'd', 'min');
    expectDecimal(result, 4320);
  });

  // --- Digital Storage Conversions ---
  it('should convert Megabytes to bits', () => {
    const result = convertUnit(1, 'MB', 'b');
    expectDecimal(result, 8e6);
  });

  it('should convert Gigabits to Kilobytes', () => {
    // 1 Gb = 1e9 bits. 1 kB = 8000 bits.
    // Result = (1 * 1e9) / 8000
    const result = convertUnit(1, 'Gb', 'kB');
    expectDecimal(result, 125000);
  });

  it('should convert Bytes to bits', () => {
    const result = convertUnit(100, 'B', 'b');
    expectDecimal(result, 800);
  });

  // --- Edge Cases and Invalid Conversions ---
  it('should handle zero correctly', () => {
    const result = convertUnit(0, 'm', 'ft');
    expectDecimal(result, 0);
  });

  it('should return null for invalid unit symbols', () => {
    const result = convertUnit(10, 'kg', 'invalid');
    expect(result).toBeNull();
  });

  it('should return null for invalid source unit symbol', () => {
    const result = convertUnit(10, 'invalid', 'kg');
    expect(result).toBeNull();
  });
}); 