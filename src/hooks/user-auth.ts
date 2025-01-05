import { useOkto } from "okto-sdk-react"
import { useState, useCallback, useEffect } from "react"
import { supabase } from '@/lib/supabase'

interface User {
  id: string;
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
      console.log('Fetching user details, isLoggedIn:', isLoggedIn)
      const details = await getUserDetails()
      console.log('Okto user details:', details)
      
      if (!details?.email || !details?.user_id) {
        throw new Error('Invalid user details from Okto')
      }

      // First try to get the user
      let { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', details.user_id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      // If user doesn't exist, create one
      if (!existingUser) {
        console.log('Creating new user in Supabase:', details)
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([{
            email: details.email,
            user_id: details.user_id
          }])
          .select()
          .single()

        if (insertError) throw insertError
        existingUser = newUser
      }

      console.log('User in Supabase:', existingUser)
      const userData = {
        id: existingUser.id,
        email: existingUser.email,
        user_id: existingUser.user_id
      }
      setUserDetails(userData)
      setError(null)

      return userData

    } catch (error) {
      console.error('Error in fetchUserDetails:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      setError(errorMessage)
      setUserDetails(null)
      return null
    } finally {
      setIsLoaded(true)
    }
  }, [getUserDetails, isLoggedIn])

  useEffect(() => {
    const initAuth = async () => {
      if (isLoggedIn) {
        console.log('User is logged in, fetching details...')
        await fetchUserDetails()
      } else {
        console.log('User is not logged in')
        setUserDetails(null)
        setIsLoaded(true)
      }
    }

    initAuth()
  }, [isLoggedIn, fetchUserDetails])

  return {
    isLoaded,
    isSignedIn: isLoggedIn,
    user: userDetails,
    error,
    fetchUserDetails,
    signOut: logOut,
    signIn: authenticate
  }
}
