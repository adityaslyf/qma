import { useAuth } from "../hooks/user-auth"
import { ReactNode } from "react"
import { useNavigate } from "react-router-dom"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSignedIn, isLoaded } = useAuth()
  console.log('isSignedIn', isSignedIn)
  const navigate = useNavigate()

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    navigate('/login')
    return null
  }

  return <>{children}</>
}
