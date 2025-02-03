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
    console.log('[ProtectedRoute] State:', {
      isInitializing,
      isSignedIn,
      hasProfile: userDetails?.hasProfile,
      pathname: location.pathname
    })

    if (isInitializing) {
      console.log('[ProtectedRoute] Still initializing, waiting...')
      return
    }

    if (!isSignedIn) {
      console.log('[ProtectedRoute] Not signed in, redirecting to login')
      navigate('/login', { 
        replace: true,
        state: { from: location.pathname }
      })
      return
    }

    if (location.pathname === '/' && userDetails?.hasProfile) {
      console.log('[ProtectedRoute] User has profile, redirecting to profile page')
      navigate('/profile', { replace: true })
    }
  }, [isInitializing, isSignedIn, userDetails, navigate, location.pathname])

  if (isInitializing) {
    console.log('[ProtectedRoute] Rendering loading spinner')
    return <LoadingSpinner />
  }

  if (!isSignedIn) {
    console.log('[ProtectedRoute] Not signed in, rendering null')
    return null
  }

  console.log('[ProtectedRoute] Rendering protected content')
  return <>{children}</>
}
