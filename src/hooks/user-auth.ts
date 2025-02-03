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

interface AuthHookReturn {
  userDetails: User | null;
  signIn: (idToken: string, callback: (result: any, error: any) => void) => void;
  signOut: () => void;
  isInitializing: boolean;
  isLoaded: boolean;
  loadingStates: LoadingStates;
  error: string | null;
  fetchUserDetails: () => Promise<void>;
  isSignedIn: boolean;
  user: User | null;
}

export function useAuth(): AuthHookReturn {
  const { getUserDetails, isLoggedIn, authenticate, logOut } = useOkto()
  const [userDetails, setUserDetails] = useState<User | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    authentication: false,
    userDetails: false
  })
  const [error, setError] = useState<string | null>(null)

  const fetchUserDetails = useCallback(async () => {
    console.log('[useAuth] Fetching user details, isLoggedIn:', isLoggedIn)
    setLoadingStates(prev => ({ ...prev, userDetails: true }))
    
    try {
      if (!isLoggedIn) {
        console.log('[useAuth] Not logged in, clearing user details')
        setUserDetails(null)
        setError(null)
        setIsInitializing(false)
        return
      }

      const details = await getUserDetails()
      console.log('[useAuth] Got user details:', details)
      
      if (!details?.email || !details?.user_id) {
        throw new Error('Invalid user details from Okto')
      }

      // First, try to get existing user
      let { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('id, email, user_id, has_profile')
        .eq('user_id', details.user_id)
        .maybeSingle()

      console.log('[useAuth] Existing user query result:', { existingUser, selectError })

      if (!existingUser) {
        // Create new user if doesn't exist
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{
            email: details.email,
            user_id: details.user_id,
            has_profile: false
          }])
          .select('id, email, user_id, has_profile')
          .single()

        console.log('[useAuth] Insert new user result:', { newUser, insertError })

        if (insertError) {
          console.error('[useAuth] Failed to insert new user:', insertError)
          throw insertError
        }
        existingUser = newUser
      }

      setUserDetails({
        id: existingUser.id,
        email: existingUser.email,
        user_id: existingUser.user_id,
        hasProfile: existingUser.has_profile
      })

    } catch (error) {
      console.error('[useAuth] Error in fetchUserDetails:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch user details')
      setUserDetails(null)
    } finally {
      setLoadingStates(prev => ({ ...prev, userDetails: false }))
      setIsInitializing(false)
    }
  }, [getUserDetails, isLoggedIn])

  // Add initialization effect
  useEffect(() => {
    console.log('[useAuth] Initial mount, isLoggedIn:', isLoggedIn)
    fetchUserDetails()
  }, [fetchUserDetails])

  const isSignedIn = isLoggedIn && !!userDetails
  console.log('[useAuth] Current state:', {
    isInitializing,
    isLoggedIn,
    hasUserDetails: !!userDetails,
    isSignedIn
  })

  return {
    userDetails,
    signIn: authenticate,
    signOut: logOut,
    isInitializing,
    isLoaded: !isInitializing,
    loadingStates,
    error,
    fetchUserDetails,
    isSignedIn,
    user: userDetails
  }
}
