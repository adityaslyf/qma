import LoginPage from "./LoginPage";
import { useAuth } from "../hooks/user-auth";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LoadingSpinner } from "../components/ui/loading-spinner";

export default function Login() {
  const { isSignedIn, isInitializing } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    console.log('[Login] State:', {
      isInitializing,
      isSignedIn,
      locationState: location.state,
      pathname: location.pathname
    })

    if (isInitializing) {
      console.log('[Login] Still initializing, waiting...')
      return
    }
    
    if (isSignedIn) {
      const from = (location.state as any)?.from || '/'
      console.log('[Login] User is signed in, navigating to:', from)
      navigate(from, { replace: true })
    }
  }, [isSignedIn, isInitializing, navigate, location])

  if (isInitializing) {
    console.log('[Login] Rendering loading spinner')
    return <LoadingSpinner />
  }

  if (isSignedIn) {
    console.log('[Login] User signed in, rendering null')
    return null
  }

  console.log('[Login] Rendering login page')
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoginPage setAuthToken={() => {}} authToken={null} handleLogout={() => {}} /> 
    </div>
  )
} 