import { useUser, useClerk } from "@clerk/clerk-react"

export function useAuth() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut } = useClerk()

  const handleSignOut = () => {
    signOut()
  }

  return {
    isLoaded,
    isSignedIn,
    user,
    signOut: handleSignOut
  }
}
