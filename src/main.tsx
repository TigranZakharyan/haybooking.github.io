import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@fontsource/playfair-display/400.css";
import '@/styles/index.css'
import App from './App.tsx'

import '@/translation'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
