import { useOkto } from "okto-sdk-react"
import { useState, useCallback } from "react"
import { supabase } from '@/lib/supabase'

interface User {
  email: string;
  user_id: string;
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
