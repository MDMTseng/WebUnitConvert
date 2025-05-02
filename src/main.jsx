import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ConversionProvider } from './contexts/ConversionContext'
import { ThemeContextProvider } from './contexts/ThemeContext'
import { CssBaseline } from '@mui/material'
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

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
