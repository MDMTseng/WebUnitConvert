import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ConversionResult from '../../components/ConversionResult';

describe('ConversionResult Component', () => {
  it('renders the result when provided', () => {
    render(<ConversionResult result="123.45" error={null} />);
    expect(screen.getByText('123.45')).toBeInTheDocument();
    expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Result will appear here/i)).not.toBeInTheDocument();
  });

  it('renders the error message when error is provided', () => {
    render(<ConversionResult result={null} error="Invalid conversion" />);
    expect(screen.getByText(/Error: Invalid conversion/i)).toBeInTheDocument();
    expect(screen.queryByText(/Result will appear here/i)).not.toBeInTheDocument();
  });

  it('renders placeholder text when no result or error', () => {
    render(<ConversionResult result={null} error={null} />);
    expect(screen.getByText(/Result will appear here/i)).toBeInTheDocument();
    expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();
  });

  it('renders result even if it is 0', () => {
    render(<ConversionResult result={0} error={null} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Result will appear here/i)).not.toBeInTheDocument();
  });
}); 