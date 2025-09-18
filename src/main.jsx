import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, RouterProvider, createBrowserRouter } from 'react-router-dom'
import Authentication, { AuthenticationMode } from './pages/Authentication'
import NotFound from './pages/NotFound.jsx'
import UserProvider from './context/UserProvider.jsx'

const router = createBrowserRouter([
  {
    errorElement: <NotFound />
  },
  {
    path:"/signin",
    element: <Authentication AuthenticationMode={AuthenticationMode.SignIn} />
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
