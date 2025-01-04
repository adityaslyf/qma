import { useOkto } from "okto-sdk-react"
import { useState, useCallback, useEffect } from "react"
import { supabase } from '@/lib/supabase'

interface User {
  email: string;
  user_id: string;
}

export function useAuth() {
  const { getUserDetails, logOut, isLoggedIn, authenticate } = useOkto()
  const [userDetails, setUserDetails] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserDetails = useCallback(async () => {
    try {
      const details = await getUserDetails()
      setUserDetails(details)
      setError(null)
      
      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', details.user_id) 

      if (supabaseError) throw supabaseError

      if (data.length === 0) {
        const { error: insertError } = await supabase
          .from('users') 
          .insert([{
            email: details.email,
            user_id: details.user_id,
          }]) 

        if (insertError) throw insertError
      }

      return details
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      setError(errorMessage)
      return null
    } finally {
      setIsLoaded(true)
    }
  }, [getUserDetails])

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserDetails()
    } else {
      setIsLoaded(true)
    }
  }, [isLoggedIn, fetchUserDetails])

  const handleSignOut = () => {
    logOut()
    setUserDetails(null)
    setError(null)
  }

  return {
    isLoaded,
    isSignedIn: isLoggedIn,
    user: userDetails,
    error,
    fetchUserDetails,
    signOut: handleSignOut,
    signIn: authenticate
  }
}
