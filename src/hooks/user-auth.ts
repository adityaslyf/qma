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
  const { getUserDetails, isLoggedIn } = useOkto()
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

      // Get both user and profile data
      const [{ data: existingUser }, { data: existingProfile }] = await Promise.all([
        supabase.from('users').select('*').eq('user_id', details.user_id).single(),
        supabase.from('profiles').select('*').eq('user_id', details.user_id).single()
      ])

      if (existingUser) {
        setUserDetails({
          id: existingUser.id,
          email: existingUser.email,
          user_id: existingUser.user_id,
          hasProfile: !!existingProfile // Set hasProfile based on profile existence
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

  useEffect(() => {
    fetchUserDetails()
  }, [fetchUserDetails])

  return {
    userDetails,
    isLoaded,
    error,
    fetchUserDetails,
    isSignedIn: !!userDetails
  }
}
