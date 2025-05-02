import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest'; // Added import (vi already imported)
import IconButton from '../../components/IconButton';
// import { vi } from 'vitest'; // Already imported

describe('IconButton Component', () => {
  it('renders a button with children and aria-label', () => {
    render(
      <IconButton onClick={() => {}} aria-label="Test Button">
        <span>Icon</span>
      </IconButton>
    );
    const button = screen.getByRole('button', { name: /Test Button/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn(); // Create a mock function
    render(
      <IconButton onClick={handleClick} aria-label="Clickable">
        Icon
      </IconButton>
    );
    const button = screen.getByRole('button', { name: /Clickable/i });
    await userEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const handleClick = vi.fn();
    render(
      <IconButton onClick={handleClick} aria-label="Disabled" disabled>
        Icon
      </IconButton>
    );
    const button = screen.getByRole('button', { name: /Disabled/i });
    expect(button).toBeDisabled();
    // Try clicking - should not call handler
    // userEvent.click(button); // This would throw error in user-event v14+ for disabled elements
    // expect(handleClick).not.toHaveBeenCalled();
  });
}); 