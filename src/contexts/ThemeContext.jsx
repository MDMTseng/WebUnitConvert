import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { getItem, setItem } from '../utils/localStorage';

const THEME_STORAGE_KEY = 'appTheme';

// Define Material UI theme palettes
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007BFF',
      light: '#4dabf5',
      dark: '#0056b3',
    },
    secondary: {
      main: '#6c757d',
    },
    background: {
      default: '#F8F9FA',
      paper: '#fff',
    },
    text: {
      primary: '#363537',
      secondary: '#6c757d',
    },
    error: {
      main: '#DC3545',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90CAF9',
      light: '#BBDEFB',
      dark: '#64B5F6',
    },
    secondary: {
      main: '#CED4DA',
    },
    background: {
      default: '#212529',
      paper: '#343A40',
    },
    text: {
      primary: '#FAFAFA',
      secondary: '#ADB5BD',
    },
    error: {
      main: '#F5C6CB',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

export const ThemeContext = createContext({
  theme: { mode: 'light' },
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeContextProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    const storedTheme = getItem(THEME_STORAGE_KEY);
    if (storedTheme) return storedTheme;

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light'; // Default to light
  });

  const toggleTheme = () => {
    setThemeMode((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Save theme preference to local storage
  useEffect(() => {
    setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  // Determine which theme object to use
  const currentTheme = useMemo(() => ({
    ...(themeMode === 'light' ? lightTheme : darkTheme),
    mode: themeMode
  }), [themeMode]);

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
      <MuiThemeProvider theme={currentTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 