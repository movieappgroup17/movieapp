import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, RouterProvider, createBrowserRouter } from 'react-router-dom'
import Authentication, { AuthenticationMode } from './pages/Authentication'
import NotFound from './pages/NotFound.jsx'
import UserProvider from './context/UserProvider.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <App />
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
)
