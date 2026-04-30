import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ProfileProvider } from './context/profileData'
import { FeedProvider } from './context/Feed'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ProfileProvider>
      <FeedProvider>
        <App />
      </FeedProvider>
    </ProfileProvider>
  </BrowserRouter>,
)
