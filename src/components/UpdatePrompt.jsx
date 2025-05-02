import React, { useState, useEffect } from 'react';
import { Snackbar, Button, Box, Typography } from '@mui/material';
import UpdateIcon from '@mui/icons-material/SystemUpdate';

/**
 * Component that handles checking for service worker updates and prompting the user
 * to reload the application when a new version is available.
 */
const UpdatePrompt = () => {
  const [showReload, setShowReload] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    // Skip if running in development mode or if service workers aren't supported
    if (
      import.meta.env.DEV || 
      !('serviceWorker' in navigator) ||
      !window.workbox
    ) {
      return;
    }

    const wb = window.workbox;

    // Add event listeners for the service worker lifecycle
    const promptForUpdate = (worker) => {
      setShowReload(true);
      setWaitingWorker(worker);
    };

    // These events come from the workbox-window package integrated with vite-plugin-pwa
    wb.addEventListener('waiting', (event) => {
      console.log('A new service worker has installed and is waiting to activate');
      promptForUpdate(event.sw);
    });

    wb.addEventListener('controlling', () => {
      console.log('A new service worker has taken control and the page will reload');
      window.location.reload();
    });

    // Register the service worker
    wb.register();
  }, []);

  const reloadPage = () => {
    if (waitingWorker) {
      // Send the SKIP_WAITING message to the waiting service worker
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
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