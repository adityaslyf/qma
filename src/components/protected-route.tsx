import { useAuth } from "../hooks/user-auth"
import { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { Loader } from "./ui/loader"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSignedIn, isLoaded } = useAuth()
  const navigate = useNavigate()

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    )
  }

  if (!isSignedIn) {
    navigate('/login', { replace: true })
    return null
  }

  return <>{children}</>
}
