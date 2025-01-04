import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import './lib/pdf-config'
import Login from './pages/Login'
import ProfileWrapper from './components/ProfileWrapper'
import { ProtectedRoute } from './components/protected-route'
import App from './App'
import { ResumeProvider } from './contexts/resume-context'
import { ProfileProvider } from './contexts/profile-context'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { OktoProvider } from 'okto-sdk-react'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const OKTO_CLIENT_API_KEY = import.meta.env.VITE_OKTO_CLIENT_API_KEY

if (!GOOGLE_CLIENT_ID) {
  throw new Error("Missing Google Client ID")
}

if (!OKTO_CLIENT_API_KEY) {
  throw new Error("Missing Okto Client API Key")
}

function Root() {
  return (
    <StrictMode>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <OktoProvider 
          apiKey={OKTO_CLIENT_API_KEY}
          config={{
            buildType: 'debug',
            authType: 'google'
          }}
        >
          <ResumeProvider>
            <ProfileProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<App />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/profile" element={<ProfileWrapper />} />
                </Routes>
              </Router>
            </ProfileProvider>
          </ResumeProvider>
        </OktoProvider>
      </GoogleOAuthProvider>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')!).render(<Root />)
