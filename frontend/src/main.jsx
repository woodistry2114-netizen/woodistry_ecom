import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import { AuthProvider } from './context/AuthContext'
import { StoreProvider } from './context/StoreContext'

import './styles.css'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <StoreProvider>
      <App />
    </StoreProvider>
  </AuthProvider>
)