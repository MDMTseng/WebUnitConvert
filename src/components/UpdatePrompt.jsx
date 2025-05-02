import React, { useState, useEffect } from 'react';
import { Snackbar, Button, Box, Typography } from '@mui/material';
import UpdateIcon from '@mui/icons-material/SystemUpdate';

/**
 * A simplified component that handles checking for service worker updates
 * and prompting the user to reload the application when a new version is available.
 */
const UpdatePrompt = () => {
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    // Skip if running in development mode or if service workers aren't supported
    if (import.meta.env.DEV || !('serviceWorker' in navigator)) {
      return;
    }

    // Simple event listener for the custom refresh event
    const handleNeedRefresh = () => {
      console.log('New content available, showing update prompt');
      setShowReload(true);
    };

    // Listen for the custom event from main.jsx
    window.addEventListener('sw-update-available', handleNeedRefresh);

    return () => {
      window.removeEventListener('sw-update-available', handleNeedRefresh);
    };
  }, []);

  const reloadPage = () => {
    // Simple page reload instead of dealing with skip waiting
    window.location.reload();
    setShowReload(false);
  };

  return (
    <Snackbar
      open={showReload}
      message="A new version is available!"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      action={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <UpdateIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2" sx={{ mr: 2 }}>Update available</Typography>
          <Button 
            color="primary" 
            size="small" 
            onClick={reloadPage}
            variant="contained"
          >
            Update Now
          </Button>
        </Box>
      }
    />
  );
};

export default UpdatePrompt; 