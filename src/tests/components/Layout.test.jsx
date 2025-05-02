import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Layout from '../../components/Layout';

describe('Layout Component', () => {
  it('renders header, children, and footer', () => {
    render(
      <Layout>
        <div>Child Content</div>
      </Layout>
    );

    // Check for header content (adjust query if needed)
    expect(screen.getByRole('heading', { name: /unit converter/i })).toBeInTheDocument();

    // Check for children
    expect(screen.getByText('Child Content')).toBeInTheDocument();

    // Check for footer content
    expect(screen.getByText(/© \d{4} Unit Converter/i)).toBeInTheDocument();
  });
}); 