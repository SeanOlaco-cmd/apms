import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './design.css'
import App from './App.jsx'
import { loadSettings, applySettings } from './lib/settings'

// Apply saved display settings before the first paint so there's no flash
// of the wrong theme.
applySettings(loadSettings())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)