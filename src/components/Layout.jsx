import React from 'react';
import { 
  Box,
  Container,
  CssBaseline,
  Paper,
  Typography
} from '@mui/material';

const Layout = ({ children }) => {
  // Format the build date in a user-friendly way
  const formatBuildDate = () => {
    try {
      // Check if the build date variable is defined (it will be undefined in dev mode)
      if (typeof __BUILD_DATE__ !== 'undefined' && __BUILD_DATE__) {
        const buildDate = new Date(__BUILD_DATE__);
        return buildDate.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      // In development, use current date/time with a DEV indicator
      if (import.meta.env.DEV) {
        return `DEV BUILD @ ${new Date().toLocaleTimeString()}`;
      }
      return '';
    } catch (e) {
      console.error('Error formatting build date:', e);
      return 'Build date unavailable';
    }
  };
  
  // Get build version if available
  const buildVersion = 
    typeof __BUILD_VERSION__ !== 'undefined' && __BUILD_VERSION__ 
      ? __BUILD_VERSION__ 
      : (import.meta.env.DEV ? 'DEV' : '');
  
  // Format the build information
  const buildInfo = formatBuildDate();
  const versionInfo = buildVersion ? `v${buildVersion}` : '';
  const buildFooter = [versionInfo, buildInfo].filter(Boolean).join(' | ');

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
        bgcolor: 'primary.dark'
      }}>
        <Typography variant="caption" color="white" align="center" sx={{ display: 'block' }}>
          &copy; {new Date().getFullYear()} Unit Converter
          {buildFooter && (
            <Box component="span" sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem', opacity: 0.8 }}>
              {buildFooter}
            </Box>
          )}
        </Typography>
      </Paper>
    </Box>
  );
};

export default Layout; 