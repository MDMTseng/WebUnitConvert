import React from 'react';
import { 
  Box,
  Container,
  CssBaseline,
  Paper,
  Typography
} from '@mui/material';

const Layout = ({ children }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      bgcolor: 'background.default',
      color: 'text.primary'
    }}>
      <CssBaseline />
      
      <Box component="main" sx={{ 
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        p: 1, // Minimal padding
        height: 0, // Forces the container to respect the flex layout
      }}>
        {children}
      </Box>
      
      <Paper component="footer" square elevation={0} sx={{ 
        py: 0.5, // Reduced padding
        px: 2,
        flexShrink: 0,
        bgcolor: 'primary.light'
      }}>
        <Typography variant="caption" color="white" align="center">
          &copy; {new Date().getFullYear()} Unit Converter
        </Typography>
      </Paper>
    </Box>
  );
};

export default Layout; 