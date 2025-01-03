import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import './lib/pdf-config'
import Login from './pages/Login'
import ProfileWrapper from './components/ProfileWrapper'
import { ProtectedRoute } from './components/protected-route'
import App from './App.tsx'
import { ResumeProvider } from './contexts/resume-context'
import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

if (!GOOGLE_CLIENT_ID) {
  throw new Error("Missing Google Client ID")
}

function Root() {
  return (
    <StrictMode>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AppWithAuth />
      </GoogleOAuthProvider>
    </StrictMode>
  );
}

// Separate component for Okto and auth logic
import { useState } from 'react'
import { OktoProvider, BuildType, AuthType } from 'okto-sdk-react'
import axios from 'axios'
import { useGoogleLogin } from '@react-oauth/google'

const OKTO_CLIENT_API_KEY = import.meta.env.VITE_OKTO_CLIENT_API_KEY

if (!OKTO_CLIENT_API_KEY) {
  throw new Error("Missing Okto Client API Key")
}

interface AuthPromise {
  resolve: (value: string) => void;
  reject: (error: unknown) => void;
}

function AppWithAuth() {
  const [authPromise, setAuthPromise] = useState<AuthPromise | null>(null);

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async ({ code }) => {
      try {
        const { data: tokens } = await axios.post<{ id_token: string }>("http://localhost:3001/auth/google", {
          code,
        });
        if (authPromise) {
          authPromise.resolve(tokens.id_token);
        }
      } catch (error) {
        console.error("Error during token exchange:", error);
        if (authPromise) {
          authPromise.reject(error);
        }
      }
    },
    onError: (error) => {
      console.error("Google Login Error:", error);
      if (authPromise) {
        authPromise.reject(error);
      }
    },
  });

  const handleGAuthCb = async (): Promise<string> => {
    console.log("Triggering Google Login...");
    
    let promiseResolve: (value: string) => void;
    let promiseReject: (error: unknown) => void;
    const promise = new Promise<string>((resolve, reject) => {
      promiseResolve = resolve;
      promiseReject = reject;
    });
    
    setAuthPromise({ resolve: promiseResolve!, reject: promiseReject! });
    googleLogin();
    return promise;
  };

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
    </OktoProvider>
  );
}

createRoot(document.getElementById('root')!).render(<Root />);
