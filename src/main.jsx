import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ConversionProvider } from './contexts/ConversionContext'
import { ThemeContextProvider } from './contexts/ThemeContext'
import { CssBaseline } from '@mui/material'
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { registerSW } from 'virtual:pwa-register';

// Register service worker
if ('serviceWorker' in navigator) {
  // This comes from vite-plugin-pwa using the virtual: import
  const wb = registerSW({
    // Called on new version available
    onNeedRefresh() {
      console.log('New content available, please refresh.');
      // The UpdatePrompt component will handle the UI for this
    },
    // Called on manual registration
    onOfflineReady() {
      console.log('App ready to work offline');
    },
    // Enable periodic SW updates check in background every hour
    registerOptions: {
      // Check for updates every hour
      periodicSync: {
        name: 'check-updates',
        minInterval: 60 * 60 * 1000 // 1 hour
      }
    }
  });
  
  // Expose workbox to window for the UpdatePrompt component
  window.workbox = wb;
}

function sendToAnalytics({ name, value, id }) {
  // In a real app, send this data to your analytics endpoint
  // For now, we just log it to the console
  console.log(`Web Vital: ${name}=${value.toFixed(2)} (id: ${id})`);
}

onCLS(sendToAnalytics);
onFCP(sendToAnalytics);
onINP(sendToAnalytics);
onLCP(sendToAnalytics);
onTTFB(sendToAnalytics);

if (process.env.NODE_ENV !== 'production') {
  // Dynamically import axe-core/react only in development
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000); // Run checks 1 sec after ReactDOM renders
  }).catch(error => {
    console.error("Failed to load axe-core/react:", error);
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <CssBaseline />
      <ConversionProvider>
        <App />
      </ConversionProvider>
    </ThemeContextProvider>
  </React.StrictMode>,
)
