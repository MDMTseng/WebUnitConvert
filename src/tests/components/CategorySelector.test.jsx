import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CategorySelector from '../../components/CategorySelector';
import { ConversionProvider } from '../../contexts/ConversionContext';

// Helper function to render with provider
const renderWithProvider = (ui, options) => {
  return render(<ConversionProvider>{ui}</ConversionProvider>, options);
};

describe('CategorySelector Component', () => {
  const mockCategories = [
    { id: 'length', name: 'Length' },
    { id: 'weight', name: 'Weight' },
  ];

  it('renders label and select element', () => {
    renderWithProvider(
      <CategorySelector
        categories={mockCategories}
        selectedCategory="length"
        onChange={() => {}}
      />
    );
    expect(screen.getByLabelText(/Category:/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders options based on props', () => {
    renderWithProvider(
      <CategorySelector
        categories={mockCategories}
        selectedCategory="weight"
        onChange={() => {}}
      />
    );
    expect(screen.getByRole('option', { name: 'Length' }).selected).toBe(false);
    expect(screen.getByRole('option', { name: 'Weight' }).selected).toBe(true);
    expect(screen.getAllByRole('option').length).toBe(2);
  });

   it('renders loading state when no categories provided', () => {
    renderWithProvider(
      <CategorySelector categories={[]} selectedCategory="" onChange={() => {}}
    />);
    expect(screen.getByRole('option', { name: /loading categories/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /loading categories/i }).disabled).toBe(true);
  });
}); 