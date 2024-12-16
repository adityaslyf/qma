import { useAuth } from "../hooks/user-auth"
import { ReactNode } from "react"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    return (
      <div className="text-center">
        <h2>Please sign in to access this content</h2>
      </div>
    )
  }

  return <>{children}</>
}
