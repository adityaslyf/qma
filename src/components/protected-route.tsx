import { useAuth } from "@/hooks/user-auth"
import { ReactNode, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { LoadingSpinner } from "./ui/loading-spinner"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSignedIn, isLoaded, userDetails } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      navigate('/login', { replace: true })
      return
    }

    // Only redirect to profile if user has a saved profile
    // and they're trying to access the home page
    if (userDetails?.hasProfile && location.pathname === '/') {
      navigate('/profile', { replace: true })
    }
  }, [isLoaded, isSignedIn, userDetails, navigate, location.pathname])

  if (!isLoaded) {
    return <LoadingSpinner />
  }

  return <>{children}</>
}
