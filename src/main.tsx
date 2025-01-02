import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import './lib/pdf-config'
import { ClerkProvider } from '@clerk/clerk-react'
import Login from './pages/Login'
import ProfileWrapper from './components/ProfileWrapper'
import { ProtectedRoute } from './components/protected-route'
import App from './App.tsx'
import { ResumeProvider } from './contexts/resume-context'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  throw new Error("Missing Clerk Publishable Key")
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <ResumeProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <App />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfileWrapper />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </ResumeProvider>
    </ClerkProvider>
  </StrictMode>,
)
