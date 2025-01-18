import { useAuth } from "@/hooks/user-auth"
import { ReactNode, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Loader } from "./ui/loader"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSignedIn, isLoaded, userDetails } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/login', { replace: true })
    } else if (isLoaded && isSignedIn && location.pathname === '/' && userDetails?.hasProfile) {
      navigate('/profile', { replace: true })
    }
  }, [isLoaded, isSignedIn, userDetails, navigate, location])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    )
  }

  return <>{children}</>
}
