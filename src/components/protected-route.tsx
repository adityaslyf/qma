import { useAuth } from "@/hooks/user-auth"
import { ReactNode, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Loader } from "./ui/loader"
import { LoadingSpinner } from "./ui/loading-spinner"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSignedIn, isLoaded, userDetails } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (!isLoaded) return

      if (!isSignedIn) {
        navigate('/login', { replace: true })
        return
      }

      // If user has a profile and they're not already on the profile page
      if (userDetails?.hasProfile && location.pathname !== '/profile') {
        navigate('/profile', { replace: true })
      }
    }

    checkAuthAndRedirect()
  }, [isLoaded, isSignedIn, userDetails, navigate, location.pathname])

  if (!isLoaded) {
    return <LoadingSpinner />
  }

  return <>{children}</>
}
