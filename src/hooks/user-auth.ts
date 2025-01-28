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
  const [isLoading, setIsLoading] = useState(false)

  const fetchUserDetails = useCallback(async () => {
    if (isLoading) return
    
    try {
      setIsLoading(true)
      
      if (!isLoggedIn) {
        setUserDetails(null)
        setIsLoaded(true)
        return
      }

      const details = await getUserDetails()
      
      if (!details?.email || !details?.user_id) {
        throw new Error('Invalid user details from Okto')
      }

      // Get user data with proper headers
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id, email, user_id')
        .eq('user_id', details.user_id)
        .maybeSingle()
        .throwOnError()

      // If user doesn't exist, create one
      if (!existingUser) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            email: details.email,
            user_id: details.user_id
          }])
          .select('id, email, user_id')
          .single()
          .throwOnError()

        if (createError) throw createError
        
        // Use the newly created user
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', newUser.user_id)
          .maybeSingle()
          .throwOnError()

        setUserDetails({
          id: newUser.id,
          email: newUser.email,
          user_id: newUser.user_id,
          hasProfile: !!profile
        })
      } else {
        // User exists, check for profile
        const { data: profile, error: profileError } = await supabase
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
      }

      setError(null)
    } catch (error) {
      console.error('Error fetching user details:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch user details')
      setUserDetails(null)
    } finally {
      setIsLoaded(true)
      setIsLoading(false)
    }
  }, [getUserDetails, isLoggedIn, isLoading])

  useEffect(() => {
    if (isLoggedIn && !userDetails && !isLoading) {
      fetchUserDetails()
    }
  }, [isLoggedIn, userDetails, fetchUserDetails, isLoading])

  return {
    userDetails,
    isLoaded,
    error,
    fetchUserDetails,
    isSignedIn: !!userDetails
  }
}
