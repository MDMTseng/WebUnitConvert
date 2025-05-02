import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ConversionProvider } from './contexts/ConversionContext'
import { ThemeContextProvider } from './contexts/ThemeContext'
import { GlobalStyles } from './utils/GlobalStyles'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeContextProvider>
      <GlobalStyles />
      <ConversionProvider>
        <App />
      </ConversionProvider>
    </ThemeContextProvider>
  </StrictMode>,
)
