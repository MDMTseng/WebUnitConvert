import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import NumericInput from './NumericInput';

describe('NumericInput', () => {
  it('renders correctly with label and initial value', () => {
    render(<NumericInput label="Amount" id="amount" value="123.45" onChange={() => {}} />);

    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('123.45');
  });

  it('calls onChange handler when value changes', async () => {
    const handleChange = vi.fn();
    render(<NumericInput label="Amount" id="amount" value="" onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    await userEvent.type(input, '987');

    // Check the last call to ensure the final value is passed
    expect(handleChange).toHaveBeenCalledTimes(3); // Called for each character '9', '8', '7'
    expect(handleChange).toHaveBeenLastCalledWith('987');
  });

  it('only allows valid numeric input (positive, negative, decimal)', async () => {
    const handleChange = vi.fn();
    render(<NumericInput label="Amount" id="amount" value="" onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    await userEvent.type(input, '12a3.b45c-');

    // onChange should only be called for valid numeric parts
    expect(handleChange).toHaveBeenCalledWith('1');
    expect(handleChange).toHaveBeenCalledWith('12');
    expect(handleChange).toHaveBeenCalledWith('123');
    expect(handleChange).toHaveBeenCalledWith('123.');
    expect(handleChange).toHaveBeenCalledWith('123.4');
    expect(handleChange).toHaveBeenCalledWith('123.45');
    // 'a', 'b', 'c', '-' should be ignored or handled depending on strictness
    expect(input).toHaveValue('123.45'); // Final valid value
  });

  it('allows negative numbers if configured (assuming default allows)', async () => {
     const handleChange = vi.fn();
     render(<NumericInput label="Temperature" id="temp" value="" onChange={handleChange} />);
     const input = screen.getByRole('textbox');

     await userEvent.type(input, '-10.5');
     expect(handleChange).toHaveBeenLastCalledWith('-10.5');
     expect(input).toHaveValue('-10.5');
  });

  // Add more tests for placeholder, required, error states if applicable
}); 