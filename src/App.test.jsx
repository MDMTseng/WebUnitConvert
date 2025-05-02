import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import { ConversionProvider } from './contexts/ConversionContext'; // Import the provider

// Helper to render App with the provider
const renderApp = () => {
  return render(
    <ConversionProvider>
      <App />
    </ConversionProvider>
  );
};

describe('App Integration Tests', () => {
  it('performs a basic length conversion (m to ft)', async () => {
    renderApp();

    const user = userEvent.setup();

    // 1. Verify initial state (optional, but good practice)
    expect(screen.getByLabelText('From')).toHaveValue('m'); // Initial from unit
    expect(screen.getByLabelText('To')).toHaveValue('ft');   // Initial to unit

    // 2. Get input field and enter value
    const input = screen.getByLabelText('Value');
    await user.clear(input);
    await user.type(input, '10');

    // 3. Check the result
    // Use a text matcher that ignores small floating point differences if needed
    // Or check within the result component for better targeting
    const resultDisplay = screen.getByTestId('conversion-result'); // Assuming ConversionResult has data-testid
    expect(within(resultDisplay).getByText(/32.808/)).toBeInTheDocument(); // 10m ~ 32.808 ft
  });

  it('updates result when changing units', async () => {
    renderApp();
    const user = userEvent.setup();

    // Enter initial value
    const input = screen.getByLabelText('Value');
    await user.clear(input);
    await user.type(input, '1');

    // Initial result (m -> ft)
    const resultDisplay = screen.getByTestId('conversion-result');
    expect(within(resultDisplay).getByText(/3.28/)).toBeInTheDocument();

    // Change 'To' unit to Kilometer
    const toSelector = screen.getByLabelText('To');
    await user.selectOptions(toSelector, 'km');

    // Check updated result (1 m -> km)
    expect(within(resultDisplay).getByText(/0.001/)).toBeInTheDocument();
  });

  it('swaps units and recalculates correctly', async () => {
    renderApp();
    const user = userEvent.setup();

    // Setup: 1 m -> ft = 3.2808...
    const input = screen.getByLabelText('Value');
    await user.clear(input);
    await user.type(input, '1');
    expect(screen.getByTestId('conversion-result')).toHaveTextContent(/3.28/);

    // Click swap button
    const swapButton = screen.getByRole('button', { name: /swap units/i });
    await user.click(swapButton);

    // Verify units are swapped
    expect(screen.getByLabelText('From')).toHaveValue('ft');
    expect(screen.getByLabelText('To')).toHaveValue('m');

    // Verify input value is updated to previous result
    expect(input).toHaveValue(/3.28/);

    // Verify new result is calculated (3.28... ft -> m)
    expect(screen.getByTestId('conversion-result')).toHaveTextContent(/1/);
  });

  it('updates units and clears result when changing category', async () => {
    renderApp();
    const user = userEvent.setup();

    // Initial category is length (m, ft, etc.)
    expect(screen.getByLabelText('From')).toHaveValue('m');

    // Enter a value to get a result
    const input = screen.getByLabelText('Value');
    await user.clear(input);
    await user.type(input, '10');
    const resultDisplay = screen.getByTestId('conversion-result');
    expect(within(resultDisplay).getByText(/32.808/)).toBeInTheDocument();

    // Change category to Weight
    const categorySelector = screen.getByLabelText('Category');
    await user.selectOptions(categorySelector, 'weight');

    // Verify units updated to default weight units (e.g., kg, lb)
    // Note: Exact defaults depend on initialState/reducer logic
    expect(screen.getByLabelText('From')).toHaveValue('kg');
    expect(screen.getByLabelText('To')).toHaveValue('lb');

    // Verify input is kept (or cleared, depending on desired behavior - current keeps)
    // expect(input).toHaveValue('10'); // Let's assume it keeps the input for now

    // Verify result is cleared (or recalculated if units are compatible, but likely cleared)
    expect(resultDisplay).not.toHaveTextContent(/32.808/);
    // Check if it shows placeholder or nothing
    expect(within(resultDisplay).queryByRole('status')).toBeNull(); // Or check for specific placeholder text

  });

  // Basic test for favorite toggle - assumes FavoriteButton is rendered
  it('toggles favorite status on button click', async () => {
    renderApp();
    const user = userEvent.setup();

    const favoriteButton = screen.getByRole('button', { name: /favorite/i }); // Adjust name based on actual button

    // Initial state (assuming default m -> ft is not favorite)
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'false');

    // Click to add favorite
    await user.click(favoriteButton);
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'true');

    // Click to remove favorite
    await user.click(favoriteButton);
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'false');
  });

  // Basic test for history - assumes HistoryList is rendered and conversion adds to history
  it('adds conversion to history list', async () => {
    renderApp();
    const user = userEvent.setup();

    // Perform a conversion
    const input = screen.getByLabelText('Value');
    await user.clear(input);
    await user.type(input, '5'); // 5 m to ft
    expect(screen.getByTestId('conversion-result')).toHaveTextContent(/16.4/);

    // Check if history list item appears (adjust selectors based on HistoryList impl)
    const historyList = screen.getByTestId('history-list'); // Add data-testid="history-list" to HistoryList
    expect(within(historyList).getByText(/5 m → .* ft/)).toBeInTheDocument();

  });

  // Add tests for SearchComponent interaction
  it('filters units when typing in search', async () => {
    renderApp();
    const user = userEvent.setup();

    const searchInput = screen.getByPlaceholderText(/search units/i);
    await user.type(searchInput, 'meter');

    // Wait for debounce and results to appear (may need waitFor)
    // Check that results list now shows Meter, Kilometer, Centimeter etc.
    // This requires SearchComponent to render results based on props
    const resultsList = await screen.findByRole('listbox'); // Assuming SearchComponent uses listbox
    expect(within(resultsList).getByText(/Meter/i)).toBeInTheDocument();
    expect(within(resultsList).getByText(/Kilometer/i)).toBeInTheDocument();
    expect(within(resultsList).queryByText(/Pound/i)).not.toBeInTheDocument();
  });

  // Add test for selecting from search
  it('selecting a search result updates the conversion setup', async () => {
    renderApp();
    const user = userEvent.setup();

    const searchInput = screen.getByPlaceholderText(/search units/i);
    await user.type(searchInput, 'kilo');

    const resultsList = await screen.findByRole('listbox');
    const kilometerResult = within(resultsList).getByText(/Kilometer/i);

    await user.click(kilometerResult);

    // Verify that the 'From' unit is now Kilometer
    expect(screen.getByLabelText('From')).toHaveValue('km');
    // Verify input is set to '1' as per handleResultSelect
    expect(screen.getByLabelText('Value')).toHaveValue('1');
    // Verify search results are cleared (listbox should disappear)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

  });

  // Add more integration tests: Category change, Favorites, History, Search -> Convert, Custom Units
}); 