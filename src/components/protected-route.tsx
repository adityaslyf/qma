import { useAuth } from "@/hooks/user-auth"
import { ReactNode, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { LoadingSpinner } from "./ui/loading-spinner"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSignedIn, isInitializing, userDetails } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Don't do anything while initializing
    if (isInitializing) return

    // If not signed in, redirect to login
    if (!isSignedIn) {
      navigate('/login', { replace: true })
      return
    }

    // Only redirect to profile if user has a saved profile
    // and they're trying to access the home page
    if (userDetails?.hasProfile && location.pathname === '/') {
      navigate('/profile', { replace: true })
    }
  }, [isInitializing, isSignedIn, userDetails, navigate, location.pathname])

  // Show loader only during initialization
  if (isInitializing) {
    return <LoadingSpinner />
  }

  // If not signed in, don't render anything (will be redirected)
  if (!isSignedIn) {
    return null
  }

  return <>{children}</>
}
