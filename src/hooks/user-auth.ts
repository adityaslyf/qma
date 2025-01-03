import { useOkto } from "okto-sdk-react"
import { useState, useCallback } from "react"

interface User {
  // Add any user properties based on Okto's user type
  [key: string]: any;
}

export function useAuth() {
  const { getUserDetails, logOut, isLoggedIn, authenticate } = useOkto()
  const [userDetails, setUserDetails] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchUserDetails = useCallback(async () => {
    try {
      const details = await getUserDetails()
      setUserDetails(details)
      setError(null)
      return details
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      setError(errorMessage)
      return null
    }
  }, [getUserDetails])

  const handleSignOut = () => {
    logOut()
    setUserDetails(null)
    setError(null)
  }

  return {
    isLoaded: true,
    isSignedIn: isLoggedIn,
    user: userDetails,
    error,
    fetchUserDetails,
    signOut: handleSignOut,
    signIn: authenticate
  }
}
