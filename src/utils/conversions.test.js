import { describe, it, expect } from 'vitest';
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

describe('convertUnit', () => {
  // --- Length Conversions ---
  it('should convert meters to feet', () => {
    const result = convertUnit(10, 'm', 'ft');
    expectDecimal(result, 32.8084);
  });

  it('should convert kilometers to miles', () => {
    const result = convertUnit(5, 'km', 'mi');
    expectDecimal(result, 3.10686);
  });

  it('should convert inches to centimeters', () => {
    const result = convertUnit(12, 'in', 'cm');
    expectDecimal(result, 30.48);
  });

  // --- Weight Conversions ---
  it('should convert kilograms to pounds', () => {
    const result = convertUnit(70, 'kg', 'lb');
    expectDecimal(result, 154.32371);
  });

  it('should convert ounces to grams', () => {
    const result = convertUnit(16, 'oz', 'g');
    expectDecimal(result, 453.592);
  });

  // --- Temperature Conversions ---
  it('should convert Celsius to Fahrenheit', () => {
    const result = convertUnit(0, 'c', 'f');
    expectDecimal(result, 32);
  });

  it('should convert Fahrenheit to Celsius', () => {
    const result = convertUnit(32, 'f', 'c');
    expectDecimal(result, 0);
  });

  it('should convert Celsius to Kelvin', () => {
    const result = convertUnit(100, 'c', 'k');
    expectDecimal(result, 373.15);
  });

  it('should convert Kelvin to Celsius', () => {
    const result = convertUnit(273.15, 'k', 'c');
    expectDecimal(result, 0);
  });

  it('should convert Fahrenheit to Kelvin', () => {
    const result = convertUnit(212, 'f', 'k');
    expectDecimal(result, 373.15);
  });

  it('should convert Kelvin to Fahrenheit', () => {
    const result = convertUnit(373.15, 'k', 'f');
    expectDecimal(result, 212);
  });

  // --- Edge Cases and Invalid Conversions ---
  it('should return the same value when converting to the same unit', () => {
    const result = convertUnit(100, 'kg', 'kg');
    expectDecimal(result, 100);
  });

  it('should handle zero correctly', () => {
    const result = convertUnit(0, 'm', 'ft');
    expectDecimal(result, 0);
  });

  it('should return null for conversions between different categories', () => {
    const result = convertUnit(10, 'kg', 'm');
    expect(result).toBeNull();
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