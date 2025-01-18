import { useOkto } from "okto-sdk-react"
import { useState, useCallback, useEffect } from "react"
import { supabase } from '@/lib/supabase'

interface User {
  id: string;
  email: string;
  user_id: string;
  hasProfile?: boolean;
}

export function useAuth() {
  const { getUserDetails, logOut, isLoggedIn, authenticate } = useOkto()
  const [userDetails, setUserDetails] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserDetails = useCallback(async () => {
    try {
      if (!isLoggedIn) {
        setUserDetails(null)
        setIsLoaded(true)
        return
      }

      const details = await getUserDetails()
      
      if (!details?.email || !details?.user_id) {
        throw new Error('Invalid user details from Okto')
      }

      // Get user and profile data
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', details.user_id)
        .single()

      if (userError && userError.code !== 'PGRST116') {
        throw userError
      }

      // If user doesn't exist, create one
      if (!existingUser) {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{
            email: details.email,
            user_id: details.user_id
          }])
          .select()
          .single()

        if (insertError) throw insertError
        setUserDetails({
          id: newUser.id,
          email: newUser.email,
          user_id: newUser.user_id
        })
      } else {
        setUserDetails({
          id: existingUser.id,
          email: existingUser.email,
          user_id: existingUser.user_id
        })
      }

      setError(null)
    } catch (error) {
      console.error('Error fetching user details:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch user details')
    } finally {
      setIsLoaded(true)
    }
  }, [getUserDetails, isLoggedIn])

  // Fetch user details when auth state changes
  useEffect(() => {
    fetchUserDetails()
  }, [fetchUserDetails, isLoggedIn])

  return {
    userDetails,
    isLoaded,
    error,
    fetchUserDetails,
    isSignedIn: !!userDetails
  }
}
