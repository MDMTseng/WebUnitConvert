import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { getItem, setItem } from '../utils/localStorage';

const THEME_STORAGE_KEY = 'appTheme';

// Define theme palettes
const lightTheme = {
  body: '#FFF',
  text: '#363537',
  toggleBorder: '#FFF',
  background: '#F8F9FA', // Lighter background
  headerBg: '#E9ECEF', // Light gray header
  footerBg: '#E9ECEF',
  borderColor: '#DDD',
  inputBg: '#FFF',
  inputBorder: '#CCC',
  resultBg: '#E9E9E9',
  listBorder: '#EEE',
  listItemHover: '#F9F9F9',
  buttonBg: '#007BFF', // Example button color
  buttonText: '#FFF',
  iconColor: '#555',
  iconHover: '#000',
  errorText: '#DC3545',
  clearButtonBg: '#F8D7DA',
  clearButtonColor: '#721C24',
  clearButtonBorder: '#F5C6CB',
  clearButtonHover: '#F5C6CB',
};

const darkTheme = {
  body: '#363537',
  text: '#FAFAFA',
  toggleBorder: '#6B8096',
  background: '#212529', // Darker background
  headerBg: '#343A40', // Dark gray header
  footerBg: '#343A40',
  borderColor: '#495057',
  inputBg: '#495057',
  inputBorder: '#6C757D',
  resultBg: '#495057',
  listBorder: '#495057',
  listItemHover: '#343A40',
  buttonBg: '#6C757D', // Example dark button color
  buttonText: '#FFF',
  iconColor: '#CED4DA',
  iconHover: '#FFF',
  errorText: '#F5C6CB',
  clearButtonBg: '#5A2D2D',
  clearButtonColor: '#F5C6CB',
  clearButtonBorder: '#721C24',
  clearButtonHover: '#721C24',
};

export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeContextProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const storedTheme = getItem(THEME_STORAGE_KEY);
    if (storedTheme) return storedTheme;

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light'; // Default to light
  });

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Save theme preference to local storage
  useEffect(() => {
    setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Determine which theme object to use
  const currentTheme = useMemo(() => (theme === 'light' ? lightTheme : darkTheme), [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {/* Use styled-components ThemeProvider to pass theme object down */}
      <StyledThemeProvider theme={currentTheme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
}; 