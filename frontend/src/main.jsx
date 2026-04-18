import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// If the frontend is served from a localhost port without a dev/proxy,
// talk to the backend directly.
try {
  const { hostname, port } = window.location
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && port && port !== '5173' && port !== '4173') {
    axios.defaults.baseURL = 'http://localhost:8081'
  }
} catch {
  // no-op
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
