import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ProfileProvider } from './context/profileData'
import { FeedProvider } from './context/Feed'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <ProfileProvider>
        <FeedProvider>
          <App />
        </FeedProvider>
      </ProfileProvider>
    </AuthProvider>
  </BrowserRouter>,
)