import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UnitSelector from '../../components/UnitSelector';

describe('UnitSelector Component', () => {
  const mockUnits = [
    { symbol: 'm', name: 'Meter' },
    { symbol: 'ft', name: 'Foot' },
  ];

  it('renders label and select element with correct id', () => {
    render(
      <UnitSelector
        label="From Unit"
        units={mockUnits}
        selectedUnit="m"
        onChange={() => {}}
        id="from-unit-select"
      />
    );
    expect(screen.getByLabelText(/From Unit:/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveAttribute('id', 'from-unit-select');
  });

  it('renders options based on props', () => {
    render(
      <UnitSelector
        label="To Unit"
        units={mockUnits}
        selectedUnit="ft"
        onChange={() => {}}
        id="to-unit-select"
      />
    );
    expect(screen.getByRole('option', { name: /Meter/i }).selected).toBe(false);
    expect(screen.getByRole('option', { name: /Foot/i }).selected).toBe(true);
    expect(screen.getAllByRole('option').length).toBe(2);
  });

  it('renders disabled state when no units provided', () => {
    render(
      <UnitSelector
        label="From Unit"
        units={[]}
        selectedUnit=""
        onChange={() => {}}
        id="from-unit-select-disabled"
      />
    );
    expect(screen.getByRole('option', { name: /Select category first/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Select category first/i }).disabled).toBe(true);
  });
}); 