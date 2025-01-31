import { useOkto } from "okto-sdk-react"
import { useState, useCallback, useEffect } from "react"
import { supabase } from '@/lib/supabase'

interface User {
  id: string;
  email: string;
  user_id: string;
  hasProfile?: boolean;
}

interface LoadingStates {
  authentication: boolean;
  userDetails: boolean;
}

export function useAuth() {
  const { getUserDetails, isLoggedIn, authenticate, logOut } = useOkto()
  const [userDetails, setUserDetails] = useState<User | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    authentication: false,
    userDetails: false
  })
  const [error, setError] = useState<string | null>(null)

  const fetchUserDetails = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, userDetails: true }))
    try {
      if (!isLoggedIn) {
        setUserDetails(null)
        setError(null)
        setIsInitializing(false)
        return
      }

      const details = await getUserDetails()
      
      if (!details?.email || !details?.user_id) {
        throw new Error('Invalid user details from Okto')
      }

      // Get user data with proper headers
      const { data: existingUser} = await supabase
        .from('users')
        .select('id, email, user_id')
        .eq('user_id', details.user_id)
        .maybeSingle()
        .throwOnError()

      if (!existingUser) {
        // First time user - don't show loader
        setIsInitializing(false)
        setUserDetails(null)
        return
      }

      // Existing user - check for profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', existingUser.user_id)
        .maybeSingle()
        .throwOnError()

      setUserDetails({
        id: existingUser.id,
        email: existingUser.email,
        user_id: existingUser.user_id,
        hasProfile: !!profile
      })

    } catch (error) {
      console.error('Error fetching user details:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch user details')
      setUserDetails(null)
    } finally {
      setLoadingStates(prev => ({ ...prev, userDetails: false }))
      setIsInitializing(false)
    }
  }, [getUserDetails, isLoggedIn])

  // Modified authenticate wrapper
  const handleAuthenticate = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, authentication: true }))
    try {
      await authenticate()
      await fetchUserDetails()
    } finally {
      setLoadingStates(prev => ({ ...prev, authentication: false }))
    }
  }, [authenticate, fetchUserDetails])

  // Separate initial load from authentication
  useEffect(() => {
    const init = async () => {
      if (isLoggedIn) {
        await fetchUserDetails()
      } else {
        setIsInitializing(false)
      }
    }
    init()
  }, [isLoggedIn, fetchUserDetails])

  return {
    userDetails,
    signIn: handleAuthenticate,
    signOut: logOut,
    isInitializing,
    loadingStates,
    error,
    fetchUserDetails,
    isSignedIn: !!userDetails
  }
}
