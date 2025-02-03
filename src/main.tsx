/// <reference types="vite/client" />

import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom'
import './lib/pdf-config'
import Login from './pages/Login'
import ProfileWrapper from './components/ProfileWrapper'
import { ProtectedRoute } from './components/protected-route'
import App from './App'
import { ResumeProvider } from './contexts/resume-context'
import { ProfileProvider } from './contexts/profile-context'
import { GoogleOAuthProvider, useGoogleLogin, CodeResponse } from '@react-oauth/google'
import { OktoProvider, BuildType, AuthType } from 'okto-sdk-react'
import "./index.css"
import axios from 'axios'

declare global {
  interface ImportMetaEnv {
    VITE_GOOGLE_CLIENT_ID: string
    VITE_OKTO_CLIENT_API_KEY: string
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const OKTO_CLIENT_API_KEY = import.meta.env.VITE_OKTO_CLIENT_API_KEY

if (!GOOGLE_CLIENT_ID) {
  throw new Error("Missing Google Client ID")
}

if (!OKTO_CLIENT_API_KEY) {
  throw new Error("Missing Okto Client API Key")
}

interface AuthPromise {
  resolve: (value: string) => void
  reject: (error: unknown) => void
}

function AppWithAuth() {
  const [authPromise, setAuthPromise] = useState<AuthPromise | null>(null)

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (response: CodeResponse) => {
      try {
        const { data: tokens } = await axios.post<{ id_token: string }>(
          "http://localhost:3001/auth/google",
          { code: response.code }
        )
        authPromise?.resolve(tokens.id_token)
      } catch (error) {
        console.error("Error during token exchange:", error)
        authPromise?.reject(error)
      }
    },
    onError: (error) => {
      console.error("Google Login Error:", error)
      authPromise?.reject(error)
    },
  })

  const handleGAuthCb = async (): Promise<string> => {
    console.log("Triggering Google Login...")
    
    return new Promise<string>((resolve, reject) => {
      setAuthPromise({ resolve, reject })
      googleLogin()
    })
  }

  const brandData = {
    title: "Test APP",
    subtitle: "Your gateway to the blockchain",
    iconUrl: "https://www.okto.com/favicon.ico"
  }

  return (
    <OktoProvider 
      apiKey={OKTO_CLIENT_API_KEY}
      buildType={BuildType.SANDBOX}
      gAuthCb={handleGAuthCb}
      primaryAuth={AuthType.EMAIL}
      brandData={brandData}
    >
      <ResumeProvider>
        <ProfileProvider>
          <BrowserRouter>
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
          </BrowserRouter>
        </ProfileProvider>
      </ResumeProvider>
    </OktoProvider>
  )
}

function Root() {
  return (
    <StrictMode>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AppWithAuth />
      </GoogleOAuthProvider>
    </StrictMode>
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')
createRoot(rootElement).render(<Root />)
