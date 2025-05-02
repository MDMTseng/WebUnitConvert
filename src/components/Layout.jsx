import React from 'react';
import { 
  AppBar,
  Box,
  Container,
  CssBaseline,
  IconButton,
  Toolbar,
  Typography,
  Paper
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

const Layout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme.mode === 'dark';

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: 'background.default',
      color: 'text.primary'
    }}>
      <CssBaseline />
      <AppBar position="static" color="primary" elevation={3}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="h1">
            Unit Converter
          </Typography>
          <IconButton 
            onClick={toggleTheme} 
            color="inherit" 
            size="large"
            aria-label="toggle dark/light mode"
          >
            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Container component="main" sx={{ 
        flexGrow: 1,
        py: 4,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {children}
      </Container>
      
      <Paper component="footer" square elevation={3} sx={{ 
        py: 2,
        px: 2,
        mt: 'auto',
        bgcolor: 'primary.light'
      }}>
        <Typography variant="body2" color="white" align="center">
          &copy; {new Date().getFullYear()} Unit Converter
        </Typography>
      </Paper>
    </Box>
  );
};

export default Layout; 