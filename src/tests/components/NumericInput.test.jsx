import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import NumericInput from '../../components/NumericInput';
import { useState } from 'react';

describe('NumericInput Component', () => {
  // Helper component to manage state for testing
  const InputWrapper = () => {
    const [value, setValue] = useState('');
    return (
      <NumericInput
        label="Amount"
        value={value}
        onChange={setValue}
        id="amount-input"
      />
    );
  };

  it('renders label and input element', () => {
    render(<InputWrapper />);
    expect(screen.getByLabelText(/Amount:/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument(); // Renders as text type
  });

  it('allows numeric input', async () => {
    render(<InputWrapper />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '123.45');
    expect(input).toHaveValue('123.45');
  });

  it('allows negative input', async () => {
    render(<InputWrapper />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '-50');
    expect(input).toHaveValue('-50');
  });

  it('prevents non-numeric characters', async () => {
    render(<InputWrapper />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'abc');
    expect(input).toHaveValue(''); // Should remain empty
    await userEvent.type(input, '12a3');
    expect(input).toHaveValue('123'); // Should filter out 'a'
  });

  it('allows only one decimal point', async () => {
    render(<InputWrapper />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '12.34.56');
    expect(input).toHaveValue('12.3456'); // Allows subsequent digits but not extra dots
  });
}); 